import Transaction from '../models/Transaction.js'
import { clearAICache } from './aiController.js'

// Safely escape special regex characters (like (, [, ?, *, +) to avoid regex syntax errors in MongoDB
let escapeRegex = (text) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

let createTransaction = async (req, res) => {
  try {
    let { type, title, amount, category, paymentMethod, description, transactionDate } = req.body

    let parsedAmount = Number(amount)

    // Validate required fields and ensure amount is a real positive number (not NaN or <= 0)
    if (!type || !title || !category || amount === undefined || isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Type, title, category, and a valid positive amount are required'
      })
    }

    let transaction = await Transaction.create({
      userId: req.userId,
      type,
      title: title.trim(),
      amount: parsedAmount,
      category,
      paymentMethod: paymentMethod || 'card',
      description: description ? description.trim() : '',
      transactionDate: transactionDate || Date.now()
    })

    clearAICache(req.userId)

    res.status(201).json({
      success: true,
      message: 'Transaction added',
      data: transaction
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

let getTransactions = async (req, res) => {
  try {
    let { page = 1, limit = 10, category, type, search, sort = 'latest' } = req.query

    let query = { userId: req.userId }
    if (category) query.category = category
    if (type) query.type = type

    // Use safely escaped regex for user searches to prevent crash on special characters
    if (search && search.trim()) {
      let safeSearch = escapeRegex(search.trim())
      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { category: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } }
      ]
    }

    let sortMap = {
      latest: { transactionDate: -1 },
      oldest: { transactionDate: 1 },
      amount_desc: { amount: -1 },
      amount_asc: { amount: 1 }
    }

    let pageNum = Number(page) || 1
    let limitNum = Number(limit) || 10

    let [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort(sortMap[sort] || sortMap.latest)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Transaction.countDocuments(query)
    ])

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.max(1, Math.ceil(total / limitNum))
      }
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

let updateTransaction = async (req, res) => {
  try {
    let { id } = req.params
    let { type, title, amount, category, paymentMethod, description, transactionDate } = req.body

    if (type && !['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Type must be income or expense'
      })
    }

    let update = {}
    if (type) update.type = type
    if (title) update.title = title.trim()

    // Validate amount if it was supplied in the update request
    if (amount !== undefined) {
      let parsedAmount = Number(amount)
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a valid positive number'
        })
      }
      update.amount = parsedAmount
    }

    if (category) update.category = category
    if (paymentMethod) update.paymentMethod = paymentMethod
    if (description !== undefined) update.description = description.trim()
    if (transactionDate) update.transactionDate = transactionDate

    let transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.userId },
      update,
      { new: true, runValidators: true }
    )

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      })
    }

    clearAICache(req.userId)

    res.status(200).json({
      success: true,
      message: 'Transaction updated',
      data: transaction
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

let deleteTransaction = async (req, res) => {
  try {
    let { id } = req.params
    let transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.userId
    })

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      })
    }

    clearAICache(req.userId)

    res.status(200).json({
      success: true,
      message: 'Transaction deleted'
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

export {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction
}
