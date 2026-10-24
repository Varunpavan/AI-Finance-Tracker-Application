import PDFDocument from 'pdfkit'
import Transaction from '../models/Transaction.js'
import Budget from '../models/Budget.js'
import { summarizeTransactions } from '../services/financeAnalyzer.js'

let formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value || 0)
}

let getMonthlyReport = async (req, res) => {
  try {
    let now = new Date()
    let rawYear = Number(req.query.year)
    let rawMonth = Number(req.query.month)

    let year = (!isNaN(rawYear) && rawYear >= 1970 && rawYear <= 2100) ? rawYear : now.getFullYear()
    let month = (!isNaN(rawMonth)) ? Math.min(12, Math.max(1, rawMonth)) : (now.getMonth() + 1)

    let start = new Date(year, month - 1, 1)
    let end = new Date(year, month, 0, 23, 59, 59, 999)

    let [transactions, budget] = await Promise.all([
      Transaction.find({
        userId: req.userId,
        transactionDate: { $gte: start, $lte: end }
      }).sort({ transactionDate: -1 }),
      Budget.findOne({ userId: req.userId })
    ])

    let summary = summarizeTransactions(transactions, budget)
    let period = start.toLocaleString('en-IN', { month: 'long', year: 'numeric' })

    let report = {
      period,
      totalIncome: summary.totalIncome,
      totalExpense: summary.totalExpense,
      savings: summary.savings,
      budgetRemaining: summary.budgetRemaining,
      categoryBreakdown: summary.categoryBreakdown,
      monthlyTrend: summary.monthlyTrend,
      transactions
    }

    // If PDF export is requested, build and stream the PDF document
    if (req.query.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename=finance-report-${year}-${String(month).padStart(2, '0')}.pdf`)

      let doc = new PDFDocument({ margin: 50 })
      doc.pipe(res)

      doc.fontSize(20).text('Finance Report', { align: 'left' })
      doc.fontSize(12).fillColor('gray').text(period)
      doc.moveDown(1)

      doc.fillColor('black').fontSize(14).text('Summary')
      doc.fontSize(11)
      doc.text(`Total Income: ${formatCurrency(report.totalIncome)}`)
      doc.text(`Total Expense: ${formatCurrency(report.totalExpense)}`)
      doc.text(`Savings: ${formatCurrency(report.savings)}`)
      doc.text(`Budget Remaining: ${formatCurrency(report.budgetRemaining)}`)
      doc.moveDown(1)

      doc.fontSize(14).text('Category Breakdown')
      doc.fontSize(11)
      if (report.categoryBreakdown.length > 0) {
        report.categoryBreakdown.forEach((item) => {
          doc.text(`${item.category}: ${formatCurrency(item.amount)}`)
        })
      } else {
        doc.text('No expenses recorded this period.')
      }
      doc.moveDown(1)

      doc.fontSize(14).text('Transactions')
      doc.fontSize(10)
      let maxPdfItems = 40
      let listed = report.transactions.slice(0, maxPdfItems)
      if (listed.length > 0) {
        listed.forEach((item) => {
          let dateStr = new Date(item.transactionDate).toLocaleDateString('en-IN')
          let sign = item.type === 'income' ? '+' : '-'
          doc.text(`${dateStr}  ${item.title} (${item.category})  ${sign}${formatCurrency(item.amount)}`)
        })

        if (report.transactions.length > maxPdfItems) {
          let remainingCount = report.transactions.length - maxPdfItems
          doc.moveDown(0.5)
          doc.fontSize(9).fillColor('gray').text(`...and ${remainingCount} more transactions (view full list in dashboard)`)
          doc.fillColor('black')
        }
      } else {
        doc.text('No transactions recorded this period.')
      }

      doc.end()
      return
    }

    res.status(200).json({
      success: true,
      data: report
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

export { getMonthlyReport }
