import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import SummaryCard from '../components/dashboard/SummaryCard'
import { getDashboardSummary } from '../services/dashboardService'
import { formatCurrency, formatDate } from '../utils/format'

let PIE_COLORS = ['#C6A15B', '#4FA98A', '#6C8CB0', '#C1495B', '#8A733F', '#E0BC7C']

let tooltipStyle = {
  background: '#1A1F28',
  border: '1px solid #262D38',
  borderRadius: 8,
  color: '#ECE9E2',
  fontSize: 13
}

function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let fetchData = async () => {
      setLoading(true)
      setError('')

      try {
        let res = await getDashboardSummary()
        setSummary(res.data.data)
      } catch (err) {
        console.log(err)
        setError(err.response?.data?.message || 'Unable to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  let trend = summary?.monthlyTrend || []
  let categories = summary?.categoryBreakdown || []

  // Format data for the income vs expense grouped bar chart
  let incomeExpense = trend.map((item) => ({
    month: item.month,
    Income: item.income,
    Expense: item.expense
  }))

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-2">Overview</p>
        <h2 className="font-display text-3xl text-bone">Dashboard</h2>
      </div>

      {loading && <p className="eyebrow">Loading dashboard…</p>}
      {error && (
        <div className="rounded-md border border-wine/40 bg-wine/10 p-4 text-sm text-wine">{error}</div>
      )}

      {!loading && !error && summary && (
        <>
          <div className="card grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-hairline">
            <SummaryCard label="Total Income" value={formatCurrency(summary.totalIncome)} tone="green" />
            <SummaryCard label="Total Expense" value={formatCurrency(summary.totalExpense)} tone="red" />
            <SummaryCard label="Remaining Budget" value={formatCurrency(summary.budgetRemaining)} tone="blue" />
            <SummaryCard label="Savings" value={formatCurrency(summary.savings)} tone="gold" />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <section className="card p-4 sm:p-6 xl:col-span-2">
              <p className="eyebrow mb-1">Trend</p>
              <h3 className="font-display text-lg text-bone">Monthly Spending</h3>
              <div className="mt-5 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid stroke="#1C222B" vertical={false} />
                    <XAxis dataKey="month" stroke="#8A8F9C" fontSize={12} tickLine={false} axisLine={{ stroke: '#262D38' }} />
                    <YAxis stroke="#8A8F9C" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
                    <Line type="monotone" dataKey="expense" stroke="#C1495B" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="card p-4 sm:p-6">
              <p className="eyebrow mb-1">Breakdown</p>
              <h3 className="font-display text-lg text-bone">By Category</h3>
              <div className="mt-5 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories} dataKey="amount" nameKey="category" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {categories.map((entry, index) => (
                        <Cell key={entry.category} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="#12161D" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <section className="card p-4 sm:p-6 xl:col-span-2">
              <p className="eyebrow mb-1">Comparison</p>
              <h3 className="font-display text-lg text-bone">Income vs Expense</h3>
              <div className="mt-5 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeExpense}>
                    <CartesianGrid stroke="#1C222B" vertical={false} />
                    <XAxis dataKey="month" stroke="#8A8F9C" fontSize={12} tickLine={false} axisLine={{ stroke: '#262D38' }} />
                    <YAxis stroke="#8A8F9C" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="Income" fill="#4FA98A" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Expense" fill="#C1495B" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="card p-4 sm:p-6">
              <p className="eyebrow mb-1">Activity</p>
              <h3 className="font-display text-lg text-bone">Recent Transactions</h3>
              <div className="mt-4 divide-y divide-hairsoft">
                {summary.recentTransactions && summary.recentTransactions.length > 0 ? (
                  summary.recentTransactions.map((item) => (
                    <div key={item._id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm text-bone">{item.title}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {item.category} · {formatDate(item.transactionDate)}
                        </p>
                      </div>
                      <p className={`tnum text-sm font-medium ${item.type === 'income' ? 'text-jade' : 'text-wine'}`}>
                        {item.type === 'income' ? '+' : '−'}{formatCurrency(item.amount)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted py-3">No transactions yet.</p>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
