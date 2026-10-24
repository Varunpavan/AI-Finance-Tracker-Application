import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { generateInsights, predictSpending } from '../controllers/aiController.js'

let router = express.Router()

router.use(protect)

router.post('/insights', generateInsights)
router.post('/predict', predictSpending)

export default router
