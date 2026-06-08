const express = require('express');
const router = express.Router();

const taskController = require('../controllers/taskController');
const { authenticate, requireTeamMember, requireManager } = require('../middleware/auth');
const { validateTaskCreation, validateObjectId, validatePagination } = require('../middleware/validation');
const { body } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');

// Apply authentication to all routes
router.use(authenticate);
router.use(requireTeamMember);

// Manager and Specific routes first
/**
 * @route   GET /api/tasks/manager-tasks
 * @desc    Get all tasks created by manager
 * @access  Private (Manager only)
 */
router.get('/manager-tasks', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Manager role required.'
      });
    }

    const tasks = await Task.find({ creator: req.user.id })
      .populate('assignee', 'firstName lastName email')
      .populate('creator', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const formattedTasks = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      assignedTo: task.assignee?.email || 'Unknown',
      assignedToName: task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : 'Unknown User',
      priority: task.priority,
      status: task.status === 'todo' ? 'pending' :
              task.status === 'in_progress' ? 'in-progress' :
              task.status === 'done' ? 'completed' :
              task.status,
      dueDate: task.dueDate,
      category: task.tags?.[0] || 'general',
      createdAt: task.createdAt
    }));

    res.json({
      success: true,
      data: formattedTasks
    });
  } catch (error) {
    console.error('Error fetching manager tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks'
    });
  }
});

/**
 * @route   POST /api/tasks/create
 * @desc    Create new task (manager only)
 * @access  Private (Manager only)
 */
router.post('/create', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Manager role required.'
      });
    }

    const { title, description, assignedTo, priority, dueDate, category } = req.body;

    if (!title || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Title and assignedTo are required'
      });
    }

    // Find the user to assign the task to
    const assigneeUser = await User.findOne({ email: assignedTo });
    if (!assigneeUser) {
      return res.status(404).json({
        success: false,
        message: 'Assigned user not found'
      });
    }

    const task = new Task({
      title,
      description,
      assignee: assigneeUser._id,
      creator: req.user.id,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags: category ? [category] : ['general'],
      status: 'todo'
    });

    await task.save();

    // Populate the assignee information
    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'firstName lastName email')
      .populate('creator', 'firstName lastName email');

    const formattedTask = {
      id: populatedTask._id,
      title: populatedTask.title,
      description: populatedTask.description,
      assignedTo: populatedTask.assignee.email,
      assignedToName: `${populatedTask.assignee.firstName} ${populatedTask.assignee.lastName}`,
      priority: populatedTask.priority,
      status: 'pending',
      dueDate: populatedTask.dueDate,
      category: populatedTask.tags?.[0] || 'general',
      createdAt: populatedTask.createdAt
    };

    res.status(201).json({
      success: true,
      data: formattedTask,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task'
    });
  }
});

/**
 * @route   GET /api/tasks/my-tasks
 * @desc    Get tasks assigned to current user
 * @access  Private
 */
router.get('/my-tasks', authenticate, async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.user.id })
      .populate('creator', 'firstName lastName email')
      .populate('assignee', 'firstName lastName email')
      .sort({ createdAt: -1 });

    const formattedTasks = tasks.map(task => ({
      id: task._id,
      title: task.title,
      description: task.description,
      createdBy: task.creator ? `${task.creator.firstName} ${task.creator.lastName}` : 'Unknown Manager',
      createdByEmail: task.creator?.email || 'unknown@example.com',
      priority: task.priority,
      status: task.status === 'todo' ? 'pending' :
              task.status === 'in_progress' ? 'in-progress' :
              task.status === 'done' ? 'completed' :
              task.status,
      dueDate: task.dueDate,
      category: task.tags?.[0] || 'general',
      createdAt: task.createdAt,
      completedDate: task.completedDate
    }));

    res.json({
      success: true,
      data: formattedTasks
    });
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks'
    });
  }
});

// General routes
/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for the authenticated user
 * @access  Private
 */
router.get('/', validatePagination, taskController.getTasks);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Private
 */
router.get('/:id', validateObjectId('id'), taskController.getTask);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', validateTaskCreation, taskController.createTask);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', [
  validateObjectId('id'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'review', 'done'])
    .withMessage('Status must be one of: todo, in_progress, review, done'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Estimated hours must be between 0 and 100'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag cannot exceed 50 characters')
], taskController.updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', validateObjectId('id'), taskController.deleteTask);

/**
 * @route   POST /api/tasks/:id/comments
 * @desc    Add a comment to a task
 * @access  Private
 */
router.post('/:id/comments', [
  validateObjectId('id'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
], taskController.addComment);

/**
 * @route   PATCH /api/tasks/:taskId/status
 * @desc    Update task status
 * @access  Private
 */
router.patch('/:taskId/status', authenticate, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user is assigned to this task or is the creator
    if (task.assignee.toString() !== req.user.id && task.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update tasks assigned to you or created by you.'
      });
    }

    // Map frontend status to backend status
    let backendStatus = status;
    if (status === 'pending') backendStatus = 'todo';
    if (status === 'in-progress') backendStatus = 'in_progress';
    if (status === 'completed') backendStatus = 'done';

    task.updateStatus(backendStatus);
    await task.save();

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: {
        id: task._id,
        status: status,
        completedDate: task.completedDate,
        startDate: task.startDate
      }
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task status'
    });
  }
});

module.exports = router;
