import Budget from '../models/Budget.js'

let isValidAmount = (value) => {
  if (value === undefined || value === null || value === '') {
    return false
  }
  return Number(value) >= 0
}

let setBudget = async (req, res) => {
  try {
    let { monthlyBudget, categoryBudgets } = req.body

    if (!isValidAmount(monthlyBudget)) {
      return res.status(400).json({
        success: false,
        message: 'A valid monthly budget is required'
      })
    }

    let budget = await Budget.findOneAndUpdate(
      { userId: req.userId },
      {
        monthlyBudget: Number(monthlyBudget),
        categoryBudgets: categoryBudgets || [],
        updatedAt: Date.now()
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    )

    res.status(200).json({
      success: true,
      message: 'Budget saved',
      data: budget
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

let getBudget = async (req, res) => {
  try {
    let budget = await Budget.findOne({ userId: req.userId })

    if (!budget) {
      return res.status(200).json({
        success: true,
        data: { monthlyBudget: 0, categoryBudgets: [] }
      })
    }

    res.status(200).json({
      success: true,
      data: budget
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

let updateBudget = async (req, res) => {
  try {
    let { monthlyBudget, categoryBudgets } = req.body

    if (!isValidAmount(monthlyBudget)) {
      return res.status(400).json({
        success: false,
        message: 'A valid monthly budget is required'
      })
    }

    let budget = await Budget.findOneAndUpdate(
      { userId: req.userId },
      {
        monthlyBudget: Number(monthlyBudget),
        categoryBudgets: categoryBudgets || [],
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    )

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Budget updated',
      data: budget
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

export { setBudget, getBudget, updateBudget }
