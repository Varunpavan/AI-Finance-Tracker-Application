import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'
import Budget from '../models/Budget.js'
import { clearAICache } from './aiController.js'

// 1. Access Token: short-lived (15 minutes) for high security
let generateAccessToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured')
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m'
  })
}

// 2. Refresh Token: long-lived (7 days) to safely renew access tokens
let generateRefreshToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured')
  }

  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  })
}

// Helper to set secure httpOnly cookies in the response
let setAuthCookies = (res, accessToken, refreshToken) => {
  let isProduction = process.env.NODE_ENV === 'production'

  // Access token cookie (expires in 15 minutes)
  res.cookie('token', accessToken, {
    httpOnly: true, // Prevents client-side JavaScript from reading cookie (protects from XSS)
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000 // 15 mins
  })

  // Refresh token cookie (expires in 7 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })
}

// Helper to clear authentication cookies on logout or account deletion
let clearAuthCookies = (res) => {
  res.clearCookie('token')
  res.clearCookie('refreshToken')
}

let sanitizeUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    email: user.email
  }
}

let signup = async (req, res) => {
  try {
    let { name, email, password } = req.body
    let normalizedEmail = email ? email.toLowerCase().trim() : ''

    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      })
    }

    let existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      })
    }

    let user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: password
    })

    let token = generateAccessToken(user._id)
    let refreshToken = generateRefreshToken(user._id)
    setAuthCookies(res, token, refreshToken)

    res.status(201).json({
      success: true,
      message: 'Account created',
      token,
      user: sanitizeUser(user)
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

let login = async (req, res) => {
  try {
    let { email, password } = req.body
    let normalizedEmail = email ? email.toLowerCase().trim() : ''

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    let user = await User.findOne({ email: normalizedEmail }).select('+password')
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    let isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    let token = generateAccessToken(user._id)
    let refreshToken = generateRefreshToken(user._id)
    setAuthCookies(res, token, refreshToken)

    res.status(200).json({
      success: true,
      message: 'Logged in',
      token,
      user: sanitizeUser(user)
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

let refreshAccessToken = async (req, res) => {
  try {
    // Read the refresh token from httpOnly cookie
    let refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'No refresh token provided'
      })
    }

    let decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)
    let user = await User.findById(decoded.id)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      })
    }

    // Generate fresh pair of tokens
    let newAccessToken = generateAccessToken(user._id)
    let newRefreshToken = generateRefreshToken(user._id)
    setAuthCookies(res, newAccessToken, newRefreshToken)

    res.status(200).json({
      success: true,
      token: newAccessToken,
      user: sanitizeUser(user)
    })
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    })
  }
}

let logout = async (req, res) => {
  clearAuthCookies(res)
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  })
}

let getMe = async (req, res) => {
  try {
    let user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.status(200).json({
      success: true,
      user: sanitizeUser(user)
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

let updateProfile = async (req, res) => {
  try {
    let { name, email } = req.body
    let normalizedEmail = email ? email.toLowerCase().trim() : ''

    if (!name || !normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      })
    }

    let existing = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.userId }
    })

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use'
      })
    }

    let user = await User.findByIdAndUpdate(
      req.userId,
      { name: name.trim(), email: normalizedEmail, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      message: 'Profile updated',
      user: sanitizeUser(user),
      data: sanitizeUser(user)
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

let changePassword = async (req, res) => {
  try {
    let { currentPassword, newPassword } = req.body

    let current = currentPassword ? String(currentPassword).trim() : ''
    let next = newPassword ? String(newPassword).trim() : ''

    if (!current || !next || next.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Provide current and a new password of at least 6 characters'
      })
    }

    if (current === next) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      })
    }

    let user = await User.findById(req.userId).select('+password')
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    let isMatch = await user.matchPassword(current)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    let isSameAsOld = await user.matchPassword(next)
    if (isSameAsOld) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be the same as your existing password'
      })
    }

    user.password = next
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: error.message
      })
    }

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

let getAccountStats = async (req, res) => {
  try {
    let userObjectId = new mongoose.Types.ObjectId(req.userId)

    let [totalsResult, transactionCount, budget] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' }
          }
        }
      ]),
      Transaction.countDocuments({ userId: req.userId }),
      Budget.findOne({ userId: req.userId })
    ])

    let totalIncome = 0
    let totalExpense = 0
    totalsResult.forEach((item) => {
      if (item._id === 'income') {
        totalIncome = item.total
      }
      if (item._id === 'expense') {
        totalExpense = item.total
      }
    })

    let savings = totalIncome - totalExpense
    let monthlyBudget = budget?.monthlyBudget || 0
    let budgetRemaining = monthlyBudget > 0 ? monthlyBudget - totalExpense : savings

    res.status(200).json({
      success: true,
      data: {
        transactionCount,
        totalIncome,
        totalExpense,
        savings,
        budgetRemaining
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

let deleteAccount = async (req, res) => {
  try {
    // Delete the user and cascade-delete all their transactions and budget records
    await Promise.all([
      Transaction.deleteMany({ userId: req.userId }),
      Budget.deleteOne({ userId: req.userId }),
      User.findByIdAndDelete(req.userId)
    ])

    clearAuthCookies(res)
    clearAICache(req.userId)

    res.status(200).json({
      success: true,
      message: 'Account and all associated records deleted successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export {
  signup,
  login,
  refreshAccessToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getAccountStats,
  deleteAccount
}
