const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Test = require('../models/Test');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Test.deleteMany({});

    // Create Users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@edutest.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        isActive: true
      },
      {
        name: 'John Student',
        email: 'student@edutest.com',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        studentId: 'STU001',
        isActive: true
      },
      {
        name: 'Jane Doe',
        email: 'jane.doe@edutest.com',
        password: await bcrypt.hash('password123', 10),
        role: 'student',
        studentId: 'STU002',
        isActive: true
      },
      {
        name: 'Mike Wilson',
        email: 'mike.wilson@edutest.com',
        password: await bcrypt.hash('password123', 10),
        role: 'student',
        studentId: 'STU003',
        isActive: true
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('✅ Users created successfully');

    // Create Tests with embedded questions
    const adminUser = createdUsers.find(user => user.role === 'admin');

    const tests = [
      {
        title: 'General Knowledge Quiz',
        description: 'A comprehensive quiz covering various subjects',
        subject: 'General',
        duration: 30,
        questions: [
          {
            question: 'What is the capital of France?',
            type: 'multiple-choice',
            options: ['London', 'Berlin', 'Paris', 'Madrid'],
            correctAnswer: 'Paris',
            points: 5,
            explanation: 'Paris is the capital and largest city of France.'
          },
          {
            question: 'What is 2 + 2?',
            type: 'multiple-choice',
            options: ['3', '4', '5', '6'],
            correctAnswer: '4',
            points: 5,
            explanation: '2 + 2 equals 4.'
          },
          {
            question: 'JavaScript is a programming language.',
            type: 'true-false',
            options: ['True', 'False'],
            correctAnswer: 'true',
            points: 5,
            explanation: 'JavaScript is indeed a programming language used primarily for web development.'
          }
        ],
        instructions: 'Please read all questions carefully before answering. You have 30 minutes to complete this test.',
        createdBy: adminUser._id,
        isPublished: true,
        scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday (available now)
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        allowedAttempts: 2,
        randomizeQuestions: true,
        showResults: true,
        tags: ['general', 'quiz', 'beginner']
      },
      {
        title: 'Mathematics Test',
        description: 'Basic mathematics assessment',
        subject: 'Mathematics',
        duration: 45,
        questions: [
          {
            question: 'What is 5 × 8?',
            type: 'multiple-choice',
            options: ['35', '40', '45', '50'],
            correctAnswer: '40',
            points: 10,
            explanation: '5 × 8 = 40'
          },
          {
            question: 'What is the square root of 64?',
            type: 'multiple-choice',
            options: ['6', '7', '8', '9'],
            correctAnswer: '8',
            points: 10,
            explanation: 'The square root of 64 is 8 because 8 × 8 = 64'
          }
        ],
        instructions: 'Solve all mathematical problems step by step.',
        createdBy: adminUser._id,
        isPublished: true,
        scheduledAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        allowedAttempts: 1,
        randomizeQuestions: false,
        showResults: true,
        tags: ['mathematics', 'calculation']
      },
      {
        title: 'Science Assessment',
        description: 'Science knowledge evaluation',
        subject: 'Science',
        duration: 60,
        questions: [
          {
            question: 'What is the largest planet in our solar system?',
            type: 'multiple-choice',
            options: ['Earth', 'Mars', 'Jupiter', 'Saturn'],
            correctAnswer: 'Jupiter',
            points: 10,
            explanation: 'Jupiter is the largest planet in our solar system.'
          },
          {
            question: 'What is the chemical symbol for water?',
            type: 'short-answer',
            correctAnswer: 'H2O',
            points: 10,
            explanation: 'Water is composed of two hydrogen atoms and one oxygen atom, hence H2O.'
          },
          {
            question: 'The Earth is flat.',
            type: 'true-false',
            options: ['True', 'False'],
            correctAnswer: 'false',
            points: 5,
            explanation: 'The Earth is spherical (oblate spheroid), not flat.'
          }
        ],
        instructions: 'Answer all science-related questions based on your knowledge.',
        createdBy: adminUser._id,
        isPublished: true,
        scheduledAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        allowedAttempts: 3,
        randomizeQuestions: true,
        showResults: true,
        tags: ['science', 'assessment']
      }
    ];

    const createdTests = await Test.insertMany(tests);
    console.log('✅ Tests created successfully');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n👤 Demo Accounts:');
    console.log('📧 Admin: admin@edutest.com / admin123');
    console.log('📧 Student: student@edutest.com / student123');
    console.log('📧 Student 2: jane.doe@edutest.com / password123');
    console.log('📧 Student 3: mike.wilson@edutest.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
