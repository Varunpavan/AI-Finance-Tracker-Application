import express from 'express'
import {
  signup,
  login,
  refreshAccessToken,
  logout,
  getMe,
  updateProfile,
  changePassword,
  getAccountStats,
  deleteAccount
} from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

let router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/refresh', refreshAccessToken)
router.post('/logout', logout)
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.put('/password', protect, changePassword)
router.get('/stats', protect, getAccountStats)
router.delete('/account', protect, deleteAccount)

export default router
