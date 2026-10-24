import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { getDashboardSummary } from '../controllers/dashboardController.js'

let router = express.Router()

router.use(protect)
router.get('/summary', getDashboardSummary)

export default router
