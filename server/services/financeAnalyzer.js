let currency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0)
}

let getMonthRange = (date = new Date()) => {
  let start = new Date(date.getFullYear(), date.getMonth(), 1)
  let end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start, end }
}

let summarizeTransactions = (transactions = [], budget = null) => {
  let income = transactions.filter((t) => t.type === 'income')
  let expense = transactions.filter((t) => t.type === 'expense')

  let totalIncome = income.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  let totalExpense = expense.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
  let savings = totalIncome - totalExpense

  let monthlyBudget = budget?.monthlyBudget || 0
  let budgetRemaining = monthlyBudget > 0 ? monthlyBudget - totalExpense : savings

  // Group expenses by category
  let categoryTotals = {}
  expense.forEach((t) => {
    if (!categoryTotals[t.category]) {
      categoryTotals[t.category] = 0
    }
    categoryTotals[t.category] += Number(t.amount) || 0
  })

  let categoryBreakdown = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)

  // Group transactions by month for trend charts
  let monthBuckets = {}
  transactions.forEach((t) => {
    let date = new Date(t.transactionDate)
    let key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (!monthBuckets[key]) {
      monthBuckets[key] = { month: key, income: 0, expense: 0 }
    }
    monthBuckets[key][t.type] += Number(t.amount) || 0
  })

  let monthlyTrend = Object.values(monthBuckets).sort((a, b) => a.month.localeCompare(b.month))

  return {
    totalIncome,
    totalExpense,
    savings,
    budgetRemaining,
    monthlyBudget,
    categoryBreakdown,
    monthlyTrend
  }
}

let analyzeFinance = ({ transactions = [], budget = null }) => {
  let summary = summarizeTransactions(transactions, budget)
  let expenseTransactions = transactions.filter((t) => t.type === 'expense')

  let insights = []
  let recommendations = []

  if (transactions.length === 0) {
    return {
      ...summary,
      insights,
      recommendations,
      predictedExpense: 0,
      confidence: 0
    }
  }

  let topCategory = summary.categoryBreakdown[0]
  if (topCategory) {
    let share = 0
    if (summary.totalExpense > 0) {
      share = Math.round((topCategory.amount / summary.totalExpense) * 100)
    }
    insights.push(
      `${topCategory.category} is your largest expense category at ${currency(topCategory.amount)}, ${share}% of total spending.`
    )
  }

  if (summary.monthlyBudget > 0) {
    if (summary.totalExpense > summary.monthlyBudget) {
      insights.push(
        `You have exceeded your monthly budget of ${currency(summary.monthlyBudget)} by ${currency(summary.totalExpense - summary.monthlyBudget)}.`
      )
    } else if (summary.totalExpense >= summary.monthlyBudget * 0.8) {
      let percentUsed = Math.round((summary.totalExpense / summary.monthlyBudget) * 100)
      insights.push(
        `You've used ${percentUsed}% of your monthly budget — approaching the limit.`
      )
    } else {
      insights.push(`You have ${currency(summary.budgetRemaining)} remaining in your monthly budget.`)
    }
  }

  let categoryBudgets = budget?.categoryBudgets || []
  categoryBudgets.forEach((cb) => {
    let matchedCategory = summary.categoryBreakdown.find((c) => c.category === cb.category)
    let spent = matchedCategory ? matchedCategory.amount : 0
    if (cb.limit > 0 && spent > cb.limit) {
      insights.push(`${cb.category} spending of ${currency(spent)} is over its ${currency(cb.limit)} limit.`)
    }
  })

  if (summary.savings < 0) {
    insights.push(`Your expenses exceed your income by ${currency(Math.abs(summary.savings))} this period.`)
  } else {
    insights.push(`You are saving ${currency(summary.savings)} so far this period. Keep it up.`)
  }

  if (topCategory) {
    let potentialSavings = Math.round(topCategory.amount * 0.15)
    recommendations.push(
      `Trimming 15% off ${topCategory.category} could free up roughly ${currency(potentialSavings)} per month.`
    )
  }

  if (summary.monthlyBudget === 0) {
    recommendations.push('Set a monthly budget to get sharper insight into overspending risk.')
  }

  let monthlyExpenseValues = summary.monthlyTrend
    .map((m) => m.expense)
    .filter((value) => value > 0)

  let predictedExpense = summary.totalExpense
  if (monthlyExpenseValues.length > 0) {
    let sum = monthlyExpenseValues.reduce((total, val) => total + val, 0)
    predictedExpense = Math.round(sum / monthlyExpenseValues.length)
  }

  let confidence = Math.min(95, Math.max(55, 55 + expenseTransactions.length * 2))

  return {
    ...summary,
    insights,
    recommendations,
    predictedExpense,
    confidence
  }
}

export { getMonthRange, summarizeTransactions, analyzeFinance }
