import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'

import authRoutes from './routes/authRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import budgetRoutes from './routes/budgetRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import reportRoutes from './routes/reportRoutes.js'

dotenv.config()

let app = express()

let allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173'
]

// Security headers and CORS configuration
app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true
}))

// Rate limiting: protects against brute-force and spam
let isDevelopment = process.env.NODE_ENV === 'development'
let apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDevelopment ? 5000 : 500, // Generous limit in local development
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after a few minutes.'
  }
})

app.use('/api', apiLimiter)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Database connection with connection pooling for scalability
let connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-finance-tracker'

    // Connection pool options: allows handling multiple concurrent database requests efficiently
    let dbOptions = {
      maxPoolSize: 20, // Maintain up to 20 active connections in the pool
      minPoolSize: 5,  // Keep at least 5 connections open to reduce latency
      serverSelectionTimeoutMS: 5000 // Fail cleanly after 5 seconds if MongoDB is unreachable
    }

    await mongoose.connect(mongoUri, dbOptions)
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error.message)
    throw error
  }
}

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/budget', budgetRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/reports', reportRoutes)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' })
})

// Central error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: err.message || 'Something went wrong'
  })
})

export { connectDB }
export default app
