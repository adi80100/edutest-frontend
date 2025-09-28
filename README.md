# EduTest - Complete Online Test Management System

EduTest is a comprehensive web-based platform designed to streamline online test conduction for educational institutes. It enables admins to create, schedule, and evaluate tests while allowing students to take exams, track their performance, and analyze results.

## Features

### For Administrators
- 📝 Create and manage tests with multiple question types (multiple-choice, true/false, short-answer, essay)
- 📊 Comprehensive analytics and reporting
- 👥 User management (students and administrators)
- ⏰ Test scheduling with start and end times
- 📋 Detailed result analysis and grading
- 📈 Performance tracking and insights
- 🔒 Secure test environment controls

### For Students  
- 🎓 Take tests in a user-friendly interface
- ⏱️ Real-time timer and auto-save functionality
- 📊 View detailed results and performance analytics
- 📈 Track progress over time
- 🔄 Multiple attempt support (if configured)
- 📱 Responsive design for mobile devices

### Technical Features
- 🔐 JWT-based authentication and authorization
- 🗄️ MongoDB database with optimized schemas
- 📱 Responsive React TypeScript frontend
- 🚀 Express.js backend with comprehensive API
- 🛡️ Security features (rate limiting, CORS, helmet)
- ⚡ Real-time auto-save functionality
- 📊 Advanced analytics with charts and graphs

## Technology Stack

### Backend
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **File Handling**: Multer
- **Logging**: Morgan

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: React Router DOM
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: React Icons
- **Notifications**: React Toastify
- **Styling**: Custom CSS with responsive design

## Project Structure

```
edutest/
├── backend/                 # Express.js backend
│   ├── config/             # Database and configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── server.js          # Main server file
├── frontend/              # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── contexts/      # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd edutest
```

### 2. Setup Backend
```bash
cd backend
npm install

# Create environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install

# Create environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 4. Database Setup
Ensure MongoDB is running on your system. The application will automatically create the database and collections on first run.

### 5. Start the Applications

#### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
The backend will start on `http://localhost:5000`

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm start
```
The frontend will start on `http://localhost:3000`

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edutest
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Default Demo Accounts

For testing purposes, you can create these demo accounts:

### Administrator
- **Email**: admin@edutest.com
- **Password**: admin123
- **Role**: Admin

### Student
- **Email**: student@edutest.com  
- **Password**: student123
- **Role**: Student

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Test Management Endpoints
- `GET /api/tests` - Get all tests (admin) or published tests (student)
- `POST /api/tests` - Create new test (admin only)
- `GET /api/tests/:id` - Get specific test
- `PUT /api/tests/:id` - Update test (admin only)
- `DELETE /api/tests/:id` - Delete test (admin only)
- `PUT /api/tests/:id/publish` - Publish test (admin only)
- `POST /api/tests/:id/start` - Start test attempt (student)
- `POST /api/tests/:id/submit` - Submit test (student)

### Results & Analytics Endpoints
- `GET /api/results/my` - Get student's results
- `GET /api/results/analytics` - Get admin analytics
- `GET /api/results/test/:testId` - Get test results (admin)
- `PUT /api/results/:id` - Update result (manual grading)
- `GET /api/results/export/:testId` - Export results to CSV

### User Management Endpoints (Admin Only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Key Features in Detail

### Test Creation
- Support for multiple question types
- Rich text questions and explanations
- Configurable point values
- Time limits and scheduling
- Randomization options

### Test Taking
- Clean, distraction-free interface
- Auto-save functionality
- Navigation between questions
- Time warning alerts
- Secure submission process

### Analytics & Reporting
- Comprehensive dashboard with key metrics
- Question-wise performance analysis
- Grade distribution charts
- Student progress tracking
- Exportable reports (CSV format)

### Security Features
- JWT-based authentication
- Role-based access control
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS protection
- Helmet security headers

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests  
cd frontend
npm test
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# The build files will be in frontend/build/
```

### Code Structure Guidelines
- Use TypeScript for type safety
- Follow component-based architecture
- Implement proper error handling
- Use async/await for asynchronous operations
- Follow RESTful API conventions
- Implement proper validation on both client and server

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.

## Future Enhancements

- [ ] Video proctoring capabilities
- [ ] Advanced question types (drag-drop, matching)
- [ ] Bulk import/export of questions
- [ ] Advanced analytics with AI insights
- [ ] Mobile app development
- [ ] Integration with popular LMS platforms
- [ ] Advanced security features (browser lockdown)
- [ ] Real-time collaboration on test creation
