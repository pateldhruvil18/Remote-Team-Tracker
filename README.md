# 🚀 Team Tracker - Remote Productivity Management System

A comprehensive full-stack MERN application for remote team productivity tracking with desktop companion app.

## ✨ Features

- 🍅 **Pomodoro Timer**: Built-in focus timer with notifications
- 📋 **Task Management**: Trello-style drag-and-drop task boards
- ⏱️ **Time Tracking**: Automatic and manual time tracking
- 📸 **Activity Tracking**: Manual time logging and productivity tracking
- 📊 **Analytics Dashboard**: Manager view with productivity charts and metrics
- 🔐 **Role-based Authentication**: JWT-based auth with Manager and Team Member roles
- 🎯 **Productivity Scoring**: Algorithm-based scoring system
- 📧 **Email System**: Team communication and notifications

## 🛠️ Tech Stack

- **Frontend**: React.js with Vite, modern hooks and context
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Web-Based**: Fully browser-based application
- **Authentication**: JWT tokens with refresh mechanism
- **Email**: Nodemailer with Gmail SMTP support
- **UI**: Responsive design with CSS modules

## 📁 Project Structure

```
Team-Tracker/
├── 📂 backend/                 # Express.js API server
│   ├── 📂 config/             # Database and app configuration
│   ├── 📂 controllers/        # Route controllers
│   ├── 📂 middleware/         # Authentication, validation, security
│   ├── 📂 models/             # MongoDB schemas
│   ├── 📂 routes/             # API route definitions
│   ├── 📂 scripts/            # Utility scripts (setup, seeding)
│   ├── 📂 services/           # Business logic services
│   ├── 📂 uploads/            # File uploads (avatars, screenshots)
│   ├── 📂 utils/              # Helper utilities
│   ├── 📄 .env                # Environment variables
│   ├── 📄 package.json        # Dependencies and scripts
│   └── 📄 server.js           # Main server file
│
├── 📂 frontend/               # React.js web application
│   ├── 📂 public/             # Static assets
│   ├── 📂 src/                # Source code
│   │   ├── 📂 components/     # Reusable React components
│   │   ├── 📂 context/        # React context providers
│   │   ├── 📂 hooks/          # Custom React hooks
│   │   ├── 📂 pages/          # Page components (including Landing.jsx)
│   │   ├── 📂 styles/         # CSS and styling
│   │   ├── 📂 utils/          # Frontend utilities
│   │   ├── 📄 App.jsx         # Main app component
│   │   └── 📄 main.jsx        # App entry point
│   ├── 📄 .env                # Frontend environment variables
│   ├── 📄 package.json        # Dependencies and scripts
│   └── 📄 vite.config.js      # Vite configuration
│
├── 📂 docs/                   # Essential documentation
│   ├── 📄 README.md           # Documentation index
│   ├── 📄 USER_MANUAL.md      # Complete user guide
│   ├── 📄 EMAIL_SETUP.md      # Email configuration
│   └── 📄 DATABASE_SETUP.md   # Database setup guide
│
├── 📄 .gitignore              # Git ignore rules
├── 📄 README.md               # Main project documentation
├── 📄 setup.bat               # Project setup script
└── 📄 start-all.bat           # Start all services script
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- MongoDB running locally or connection string
- Git for cloning the repository

### 1. Clone and Setup

```bash
git clone <repository-url>
cd Team-Tracker
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
node scripts/create-manager.js  # Create manager account
npm run dev  # Start backend server
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev  # Start frontend development server
```

## 🔑 Default Login Credentials

**Manager Account:**

- Email: `dhchaudhary973@gmail.com`
- Password: `dhp@973`
- Role: Manager (full system access)

## 📚 Documentation

For detailed setup, usage, and troubleshooting information, see the [docs](./docs/) folder:

- **[User Manual](./docs/USER_MANUAL.md)** - Complete usage guide
- **[Email Setup](./docs/EMAIL_SETUP.md)** - Email configuration
- **[Database Setup](./docs/DATABASE_SETUP.md)** - MongoDB setup guide
- **[Troubleshooting](./docs/EMAIL_TROUBLESHOOTING.md)** - Common issues

## 🌐 Application URLs

When running locally:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Health Check**: http://localhost:5001/health

## 📧 Email System

The application includes a comprehensive email system for:

- Welcome emails for new users
- Team announcements from managers
- User invitations and onboarding
- Productivity reports and alerts

Email is configured to use Gmail SMTP or falls back to test email service for development.

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Role-based access control (Manager/Team Member)
- Password hashing with bcrypt
- Rate limiting and security headers
- Input validation and sanitization

## 📱 Responsive Design

The web application is fully responsive and works on:

- Desktop computers
- Laptops
- Tablets
- Mobile devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For support and questions:

1. Check the [documentation](./docs/)
2. Review [troubleshooting guides](./docs/EMAIL_TROUBLESHOOTING.md)
3. Verify system requirements and setup

---

**Built with ❤️ for remote team productivity**
