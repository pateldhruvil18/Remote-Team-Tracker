const { Task, User } = require('../models');

/**
 * Get all tasks for the authenticated user
 */
const getTasks = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    
    const filter = { assignee: req.user._id };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    const tasks = await Task.find(filter)
      .populate('assignee', 'firstName lastName email')
      .populate('creator', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Task.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get a single task by ID
 */
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'firstName lastName email')
      .populate('creator', 'firstName lastName email')
      .populate('comments.user', 'firstName lastName email');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Check if user has access to this task
    if (task.assignee._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create a new task
 */
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      assignee,
      priority = 'medium',
      estimatedHours,
      dueDate,
      tags
    } = req.body;
    
    // Verify assignee exists
    const assigneeUser = await User.findById(assignee);
    if (!assigneeUser) {
      return res.status(400).json({
        success: false,
        message: 'Assignee not found'
      });
    }
    
    const task = new Task({
      title,
      description,
      assignee,
      creator: req.user._id,
      priority,
      estimatedHours,
      dueDate,
      tags,
      team: req.user.team
    });
    
    await task.save();
    await task.populate('assignee', 'firstName lastName email');
    await task.populate('creator', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update a task
 */
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Check if user has permission to update this task
    if (task.assignee.toString() !== req.user._id.toString() && 
        task.creator.toString() !== req.user._id.toString() &&
        req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const allowedUpdates = [
      'title', 'description', 'status', 'priority', 
      'estimatedHours', 'dueDate', 'tags'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });
    
    // Update status-related fields
    if (req.body.status) {
      task.updateStatus(req.body.status);
    }
    
    await task.save();
    await task.populate('assignee', 'firstName lastName email');
    await task.populate('creator', 'firstName lastName email');
    
    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a task
 */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    // Check if user has permission to delete this task
    if (task.creator.toString() !== req.user._id.toString() &&
        req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    await Task.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Add a comment to a task
 */
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    task.addComment(req.user._id, content);
    await task.save();
    await task.populate('comments.user', 'firstName lastName email');
    
    res.json({
      success: true,
      message: 'Comment added successfully',
      data: { task }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment
};
