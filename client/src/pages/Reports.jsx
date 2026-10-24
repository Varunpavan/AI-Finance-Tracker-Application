import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { downloadMonthlyReport, getMonthlyReport } from '../services/reportService'
import { formatCurrency, formatDate } from '../utils/format'

let inputClass =
  'bg-surface border border-hairline rounded-md px-3 py-2 text-sm text-bone focus:outline-none focus:border-brass transition-colors'

let tooltipStyle = {
  background: '#1A1F28',
  border: '1px solid #262D38',
  borderRadius: 8,
  color: '#ECE9E2',
  fontSize: 13
}

function Reports() {
  let now = new Date()
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() })
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let fetchData = async () => {
      setLoading(true)
      setError('')

      try {
        let res = await getMonthlyReport(period)
        setReport(res.data.data)
      } catch (err) {
        console.log(err)
        setError(err.response?.data?.message || 'Unable to load report')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period])

  let handleExportPdfClick = async () => {
    try {
      let res = await downloadMonthlyReport(period)
      let url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      let link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `finance-report-${period.year}-${String(period.month).padStart(2, '0')}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.log(err)
      setError('Unable to download PDF')
    }
  }

  let handleMonthChange = (event) => {
    setPeriod({ ...period, month: Number(event.target.value) })
  }

  let handleYearChange = (event) => {
    setPeriod({ ...period, year: Number(event.target.value) })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-2">Statements</p>
          <h2 className="font-display text-3xl text-bone">Reports</h2>
        </div>
        <button
          onClick={handleExportPdfClick}
          className="rounded-md bg-brass px-4 py-2.5 text-sm font-semibold text-ink hover:bg-brass-bright transition-colors"
        >
          Export PDF
        </button>
      </div>

      <section className="card p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={period.month}
            onChange={handleMonthChange}
            className={inputClass}
          >
            {Array.from({ length: 12 }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {new Date(2024, index, 1).toLocaleString('en-IN', { month: 'long' })}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={period.year}
            onChange={handleYearChange}
            className={inputClass}
          />
        </div>
      </section>

      {loading && <p className="eyebrow">Loading report...</p>}
      {error && <div className="rounded-md border border-wine/40 bg-wine/10 p-3 text-sm text-wine">{error}</div>}

      {!loading && !error && report && (
        <>
          <div className="card grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 divide-x-0 sm:divide-x divide-hairline">
            <div className="px-4 py-4 sm:px-6 sm:py-5">
              <p className="eyebrow">Income</p>
              <p className="font-display text-xl sm:text-2xl tnum text-jade mt-2">{formatCurrency(report.totalIncome)}</p>
            </div>
            <div className="px-4 py-4 sm:px-6 sm:py-5">
              <p className="eyebrow">Expense</p>
              <p className="font-display text-xl sm:text-2xl tnum text-wine mt-2">{formatCurrency(report.totalExpense)}</p>
            </div>
            <div className="px-4 py-4 sm:px-6 sm:py-5">
              <p className="eyebrow">Savings</p>
              <p className="font-display text-xl sm:text-2xl tnum text-bone mt-2">{formatCurrency(report.savings)}</p>
            </div>
            <div className="px-4 py-4 sm:px-6 sm:py-5">
              <p className="eyebrow">Remaining</p>
              <p className="font-display text-xl sm:text-2xl tnum text-denim mt-2">{formatCurrency(report.budgetRemaining)}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <section className="card p-4 sm:p-6 xl:col-span-2">
              <p className="eyebrow mb-1">Analytics</p>
              <h3 className="font-display text-lg text-bone">By Category</h3>
              <div className="mt-5 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={report.categoryBreakdown}>
                    <CartesianGrid stroke="#1C222B" vertical={false} />
                    <XAxis dataKey="category" stroke="#8A8F9C" fontSize={12} tickLine={false} axisLine={{ stroke: '#262D38' }} />
                    <YAxis stroke="#8A8F9C" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill="#C6A15B" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="card p-4 sm:p-6">
              <p className="eyebrow mb-1">Entries</p>
              <h3 className="font-display text-lg text-bone">Transactions</h3>
              <div className="mt-4 max-h-72 overflow-auto divide-y divide-hairsoft">
                {report.transactions && report.transactions.length > 0 ? (
                  report.transactions.map((item) => (
                    <div key={item._id} className="py-3 first:pt-0">
                      <div className="flex justify-between">
                        <p className="text-sm text-bone">{item.title}</p>
                        <p className={`tnum text-sm font-medium ${item.type === 'income' ? 'text-jade' : 'text-wine'}`}>
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        {item.category} · {formatDate(item.transactionDate)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted py-3">No transactions for this period.</p>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}

export default Reports
