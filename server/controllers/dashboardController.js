import mongoose from 'mongoose'
import Transaction from '../models/Transaction.js'
import Budget from '../models/Budget.js'

let getDashboardSummary = async (req, res) => {
  try {
    let userObjectId = new mongoose.Types.ObjectId(req.userId)

    // Execute queries in parallel using MongoDB aggregation pipelines
    // MongoDB calculates math in the DB engine instead of pulling thousands of records into Node.js
    let [totalsResult, categoryResult, trendResult, recentTransactions, budget] = await Promise.all([
      // 1. Calculate overall income and expense
      Transaction.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' }
          }
        }
      ]),

      // 2. Group expenses by category, sorted from highest to lowest
      Transaction.aggregate([
        { $match: { userId: userObjectId, type: 'expense' } },
        {
          $group: {
            _id: '$category',
            amount: { $sum: '$amount' }
          }
        },
        { $sort: { amount: -1 } }
      ]),

      // 3. Group by year-month for trend charts
      Transaction.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: {
              month: { $dateToString: { format: '%Y-%m', date: '$transactionDate' } },
              type: '$type'
            },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.month': 1 } }
      ]),

      // 4. Fetch only the 5 most recent transactions
      Transaction.find({ userId: req.userId })
        .sort({ transactionDate: -1 })
        .limit(5),

      // 5. Fetch budget setting
      Budget.findOne({ userId: req.userId })
    ])

    // Calculate total income and total expense
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

    // Format category breakdown
    let categoryBreakdown = categoryResult.map((item) => ({
      category: item._id,
      amount: item.amount
    }))

    // Format monthly trend array: [{ month: '2026-08', income: 1000, expense: 500 }]
    let monthBuckets = {}
    trendResult.forEach((item) => {
      let monthKey = item._id.month
      let type = item._id.type

      if (!monthBuckets[monthKey]) {
        monthBuckets[monthKey] = { month: monthKey, income: 0, expense: 0 }
      }
      monthBuckets[monthKey][type] = item.total
    })

    let monthlyTrend = Object.values(monthBuckets).sort((a, b) => a.month.localeCompare(b.month))

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        savings,
        budgetRemaining,
        monthlyTrend,
        categoryBreakdown,
        recentTransactions
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

export { getDashboardSummary }
