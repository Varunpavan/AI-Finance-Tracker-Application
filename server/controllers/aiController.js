import Transaction from '../models/Transaction.js'
import Budget from '../models/Budget.js'
import { generateAIInsights, predictExpense } from '../services/aiService.js'

// Simple in-memory cache to store insights and predictions per user
// Prevents slow repeated HTTP calls to OpenAI and saves API tokens
let insightsCache = new Map()
let predictionCache = new Map()
let CACHE_TTL = 15 * 60 * 1000 // 15 minutes

let clearAICache = (userId) => {
  if (userId) {
    let key = String(userId)
    insightsCache.delete(key)
    predictionCache.delete(key)
  }
}

let generateInsights = async (req, res) => {
  try {
    let cacheKey = String(req.userId)

    // Check if we already have a recent insight cached for this user
    let cached = insightsCache.get(cacheKey)
    let isFresh = cached && (Date.now() - cached.timestamp < CACHE_TTL)

    if (isFresh) {
      return res.status(200).json({
        success: true,
        data: cached.data,
        insights: cached.data.insights
      })
    }

    let [transactions, budget] = await Promise.all([
      Transaction.find({ userId: req.userId }),
      Budget.findOne({ userId: req.userId })
    ])

    let result = await generateAIInsights({ transactions, budget })

    // Save to cache with current timestamp
    insightsCache.set(cacheKey, {
      timestamp: Date.now(),
      data: result
    })

    res.status(200).json({
      success: true,
      data: result,
      insights: result.insights
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

let predictSpending = async (req, res) => {
  try {
    let cacheKey = String(req.userId)

    // Check if we already have a recent prediction cached for this user
    let cached = predictionCache.get(cacheKey)
    let isFresh = cached && (Date.now() - cached.timestamp < CACHE_TTL)

    if (isFresh) {
      return res.status(200).json({
        success: true,
        data: cached.data,
        prediction: cached.data
      })
    }

    let [transactions, budget] = await Promise.all([
      Transaction.find({ userId: req.userId }),
      Budget.findOne({ userId: req.userId })
    ])

    let prediction = await predictExpense({ transactions, budget })

    // Save to cache with current timestamp
    predictionCache.set(cacheKey, {
      timestamp: Date.now(),
      data: prediction
    })

    res.status(200).json({
      success: true,
      data: prediction,
      prediction
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export { generateInsights, predictSpending, clearAICache }
