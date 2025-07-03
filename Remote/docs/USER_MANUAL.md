# 📋 Team Tracker - Complete Manual Usage Guide

## 🚀 Quick Start Overview

**Team Tracker** is a comprehensive productivity monitoring system with two main components:

1. **Web Application** (React) - Main dashboard for users and managers with browser-based screenshot capture
2. **Backend Server** (Node.js) - API and data management

---

## 🛠️ System Requirements

- **Operating System**: Windows 10/11, macOS 10.14+, or Linux
- **Node.js**: Version 16 or higher
- **MongoDB**: Version 4.4 or higher
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 2GB free space
- **Internet**: Stable connection for cloud features

---

## ⚙️ Initial Setup (One-Time)

### Step 1: Start MongoDB

```bash
# Make sure MongoDB is running on your system
# Default connection: mongodb://localhost:27017
```

### Step 2: Setup Backend Server

```bash
# Navigate to backend folder
cd backend

# Install dependencies (if not done)
npm install

# Create manager account
node create-manager.js

# Start the server
npm run dev
# OR
node server.js
```

**Expected Output**: Server running on http://localhost:5001

### Step 3: Setup Frontend Application

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies (if not done)
npm install

# Start the development server
npm run dev
# OR
npx vite --host 0.0.0.0 --port 3000
```

**Expected Output**: Frontend running on http://localhost:3000

---

## 👥 User Accounts & Login

### Manager Account (Pre-configured)

- **Email**: dhchaudhary973@gmail.com
- **Password**: dhp@973
- **Role**: Manager
- **Capabilities**: Full system access, team management, analytics

### Creating Team Member Accounts

1. **Option A**: Manager creates accounts via web dashboard
2. **Option B**: Self-registration (if enabled)
3. **Option C**: Direct database creation

---

## 🌐 Web Application Usage

### For Managers

#### 1. Login Process

1. Open browser and go to `http://localhost:3000`
2. Enter manager credentials:
   - Email: dhchaudhary973@gmail.com
   - Password: dhp@973
3. Click "Sign In"

#### 2. Manager Dashboard Features

- **Team Overview**: See all team members' status
- **Productivity Analytics**: Charts and metrics
- **Screenshot Gallery**: View team screenshots
- **Task Management**: Create and assign tasks
- **Email System**: Send team announcements
- **Database Viewer**: Manage user accounts

#### 3. Creating Tasks

1. Navigate to "Tasks" page
2. Click "Create New Task"
3. Fill in details:
   - Title and description
   - Assign to team member
   - Set priority (Low/Medium/High/Urgent)
   - Set due date
   - Add tags
4. Click "Create Task"

#### 4. Sending Team Emails

1. Go to Manager Dashboard
2. Find "Team Communication" section
3. Enter subject and message
4. Click "Send to All Team Members"

### For Team Members

#### 1. Login Process

1. Open browser and go to `http://localhost:3000`
2. Enter your credentials (provided by manager)
3. Click "Sign In"

#### 2. Team Member Dashboard Features

- **Personal Productivity Stats**: Your own metrics
- **Task Board**: View and update assigned tasks
- **Pomodoro Timer**: Focus timer for work sessions
- **Time Tracking**: Log work hours
- **Profile Management**: Update personal info

#### 3. Using Pomodoro Timer

1. Navigate to "Timer" page
2. Choose session type:
   - **Focus Time**: 25 minutes work
   - **Short Break**: 5 minutes rest
   - **Long Break**: 15 minutes rest
3. Click "Start Timer"
4. Work until timer completes
5. Take break when prompted

#### 4. Managing Tasks

1. Go to "Tasks" page
2. View tasks in different columns:
   - **To Do**: Not started
   - **In Progress**: Currently working
   - **Review**: Completed, awaiting review
   - **Done**: Fully completed
3. Drag tasks between columns to update status
4. Click task to add comments or update details

---

## 📊 Understanding Productivity Metrics

### Scoring System (0-100 points)

- **Focus Score**: Based on Pomodoro completion
- **Task Score**: Based on task completion rate
- **Activity Score**: Based on screenshot analysis
- **Overall Score**: Weighted average of all scores

### Analytics Dashboard

- **Daily/Weekly/Monthly views**
- **Team comparison charts**
- **Individual progress tracking**
- **Goal setting and achievement**

---

## 🔧 Troubleshooting Common Issues

### Backend Server Won't Start

```bash
# Check if port 5001 is in use
netstat -ano | findstr :5001

# Kill process if needed (Windows)
taskkill /PID [PID_NUMBER] /F

# Restart server
node server.js
```

### Frontend Won't Load

```bash
# Try different port
npx vite --host 0.0.0.0 --port 3001

# Clear cache
npm run build
npm run preview
```

### Database Connection Issues

```bash
# Verify MongoDB is running
mongosh

# Check connection string in .env file
MONGODB_URI=mongodb://127.0.0.1:27017/productivity_tracker
```

---

## 📧 Email System

### Configuration

- Uses Gmail SMTP
- Manager email: dhchaudhary973@gmail.com
- App password configured in backend/.env

### Features

- Welcome emails for new users
- Team announcements
- Task notifications
- Productivity reports

---

## 🔒 Security Features

### Authentication

- JWT token-based authentication
- Role-based access control
- Password hashing with bcrypt
- Session management

### Data Protection

- Screenshot encryption
- Secure file uploads
- Rate limiting
- Input validation

---

## 📱 System Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (React)       │◄──►│   (Node.js)     │
│   Port: 3000    │    │   Port: 5001    │
│ Browser-based   │    │   Screenshots   │
│  Screenshots    │    │   & File API    │
└─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │    MongoDB      │
                       │   Port: 27017   │
                       └─────────────────┘
```

---

## 🎯 Best Practices

### For Managers

1. **Regular Check-ins**: Review team analytics weekly
2. **Clear Task Assignment**: Provide detailed task descriptions
3. **Reasonable Goals**: Set achievable productivity targets
4. **Privacy Respect**: Use screenshot data responsibly

### For Team Members

1. **Consistent Usage**: Use Pomodoro timer regularly
2. **Task Updates**: Keep task status current
3. **Screenshot Monitoring**: Enable browser-based capture when needed
4. **Profile Maintenance**: Update personal information

---

## 🆘 Support & Maintenance

### Log Files

- Backend logs: Console output
- Frontend logs: Browser developer tools

### Data Backup

- MongoDB database backup recommended
- Screenshot files in backend/uploads folder
- Configuration files (.env files)

### Updates

- Pull latest code from repository
- Run `npm install` in each component
- Restart all services

---

## 📞 Contact Information

For technical support or questions:

- Check logs for error messages
- Verify all services are running
- Ensure database connectivity
- Review configuration files

**System Status Check**:

- Backend: http://localhost:5001/health
- Frontend: http://localhost:3000
- Database: Use MongoDB Compass or mongosh

---

## 🎮 Step-by-Step Usage Scenarios

### Scenario 1: Manager Setting Up a New Project

1. **Login as Manager**

   ```
   URL: http://localhost:3000
   Email: dhchaudhary973@gmail.com
   Password: dhp@973
   ```

2. **Create Team Member Account**

   - Go to Database Viewer
   - Click "Add New User"
   - Fill details: Name, Email, Role (team_member)
   - Send credentials to team member

3. **Create Project Tasks**

   - Navigate to Tasks page
   - Create tasks with priorities
   - Assign to team members
   - Set deadlines

4. **Monitor Progress**
   - Check Analytics dashboard daily
   - Review screenshot gallery
   - Send team updates via email

### Scenario 2: Team Member Daily Workflow

1. **Open Web Dashboard**

   ```
   URL: http://localhost:3000
   Login with your credentials
   ```

2. **Check Assigned Tasks**

   - Go to Tasks page
   - Review today's assignments
   - Move tasks to "In Progress"

3. **Use Pomodoro Timer**

   - Navigate to Timer page
   - Start 25-minute focus session
   - Take breaks as prompted
   - Complete 4-6 sessions per day

4. **Update Task Progress**
   - Move completed tasks to "Review"
   - Add comments on progress
   - Log time spent

### Scenario 3: Weekly Team Review

1. **Manager Reviews Analytics**

   - Check team productivity scores
   - Identify top performers
   - Note areas for improvement

2. **Send Team Feedback**

   - Use email system for announcements
   - Provide individual feedback
   - Set goals for next week

3. **Adjust Task Assignments**
   - Redistribute workload if needed
   - Update task priorities
   - Plan upcoming projects

---

## 🔍 Advanced Features

### API Endpoints (for developers)

```
Authentication:
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh

Tasks:
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id

Screenshots:
POST /api/screenshots
GET /api/screenshots
GET /api/screenshots/stats

Email:
POST /api/email/team-announcement
POST /api/email/welcome

Database:
GET /api/database/overview
GET /api/database/users
```

### Environment Variables

```bash
# Backend (.env)
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/productivity_tracker
JWT_SECRET=your_secret_key
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password

# Frontend (.env)
VITE_API_URL=http://localhost:5001/api


```

### Database Collections

- **users**: User accounts and settings
- **tasks**: Project tasks and assignments
- **screenshots**: Captured images and metadata
- **productivitymetrics**: Analytics and scores
- **timeentries**: Time tracking data

---

## 🚨 Important Notes

### Privacy Considerations

- Screenshots capture everything on screen
- Data stored locally and on server
- Manager has access to team member data
- Comply with local privacy laws

### Performance Tips

- Close unnecessary applications during monitoring
- Ensure stable internet connection
- Regular database maintenance
- Monitor disk space for screenshots

### Security Recommendations

- Change default passwords immediately
- Use strong JWT secrets in production
- Enable HTTPS in production
- Regular security updates

---

## ✅ System Verification Checklist

Before using the system, verify:

- [ ] MongoDB is running and accessible
- [ ] Backend server starts without errors
- [ ] Frontend loads in browser
- [ ] Browser-based screenshot capture works
- [ ] Manager account login works
- [ ] Screenshot capture functions
- [ ] Email system configured
- [ ] Task creation works
- [ ] Pomodoro timer functions
- [ ] Analytics display correctly

**Congratulations! Your Team Tracker system is ready for use.**
