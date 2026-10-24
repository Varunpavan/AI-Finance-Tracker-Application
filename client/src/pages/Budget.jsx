import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBudget, saveBudget } from '../redux/slices/budgetSlice'
import { getDashboardSummary } from '../services/dashboardService'
import { categories, formatCurrency } from '../utils/format'

let inputClass =
  'w-full bg-surface border border-hairline rounded-md px-3 py-2 text-sm text-bone focus:outline-none focus:border-brass transition-colors'

function Budget() {
  let dispatch = useDispatch()
  let budget = useSelector((state) => state.budget)

  const [monthlyBudget, setMonthlyBudget] = useState(0)
  const [categoryBudgets, setCategoryBudgets] = useState([])
  const [summary, setSummary] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let fetchData = async () => {
      dispatch(fetchBudget())

      try {
        let res = await getDashboardSummary()
        setSummary(res.data.data)
      } catch (err) {
        console.log(err)
      }
    }

    fetchData()
  }, [dispatch])

  // Copy budget from store into local form state once loaded
  useEffect(() => {
    setMonthlyBudget(budget.monthlyBudget)
    setCategoryBudgets(budget.categories)
  }, [budget.monthlyBudget, budget.categories])

  let handleAddCategoryClick = () => {
    setCategoryBudgets([...categoryBudgets, { category: 'Food', limit: 0 }])
  }

  let updateCategory = (index, field, value) => {
    setCategoryBudgets(
      categoryBudgets.map((item, i) => {
        if (i === index) {
          return { ...item, [field]: field === 'limit' ? Number(value) : value }
        }
        return item
      })
    )
  }

  let removeCategory = (index) => {
    setCategoryBudgets(categoryBudgets.filter((_, i) => i !== index))
  }

  let handleMonthlyBudgetChange = (event) => {
    setMonthlyBudget(event.target.value)
  }

  let handleSaveSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    try {
      await dispatch(saveBudget({ monthlyBudget: Number(monthlyBudget), categoryBudgets })).unwrap()
      let res = await getDashboardSummary()
      setSummary(res.data.data)
      setMessage('Budget saved successfully.')
    } catch (err) {
      console.log(err)
      setMessage(err || 'Unable to save budget.')
    }
  }

  let totalExpense = summary?.totalExpense || 0
  let remaining = Number(monthlyBudget || 0) - totalExpense
  let usedPercent = 0
  if (monthlyBudget > 0) {
    usedPercent = Math.min(100, Math.round((totalExpense / monthlyBudget) * 100))
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow mb-2">Limits</p>
        <h2 className="font-display text-3xl text-bone">Budget</h2>
      </div>

      {message && <div className="rounded-md border border-jade/40 bg-jade/10 p-3 text-sm text-jade">{message}</div>}
      {budget.error && <div className="rounded-md border border-wine/40 bg-wine/10 p-3 text-sm text-wine">{budget.error}</div>}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card p-4 sm:p-6 xl:col-span-2">
          <form onSubmit={handleSaveSubmit} className="space-y-6">
            <div>
              <label className="eyebrow block mb-2">Monthly Budget</label>
              <input
                type="number"
                min="0"
                value={monthlyBudget}
                onChange={handleMonthlyBudgetChange}
                className={inputClass}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="eyebrow">Category Limits</p>
              <button type="button" onClick={handleAddCategoryClick} className="text-xs text-brass hover:text-brass-bright transition-colors">
                + Add Category
              </button>
            </div>

            <div className="space-y-4">
              {categoryBudgets.map((item, index) => {
                let spent = summary?.categoryBreakdown?.find((entry) => entry.category === item.category)?.amount || 0
                let percent = item.limit ? Math.min(100, Math.round((spent / item.limit) * 100)) : 0

                let handleCategorySelectChange = (e) => {
                  updateCategory(index, 'category', e.target.value)
                }

                let handleLimitInputChange = (e) => {
                  updateCategory(index, 'limit', e.target.value)
                }

                let handleRemoveClick = () => {
                  removeCategory(index)
                }

                return (
                  <div key={`${item.category}-${index}`} className="border-b border-hairsoft pb-4 last:border-0 last:pb-0">
                    <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                      <select value={item.category} onChange={handleCategorySelectChange} className={inputClass}>
                        {categories.map((category) => (
                          <option key={category}>{category}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="0"
                        value={item.limit}
                        onChange={handleLimitInputChange}
                        className={inputClass}
                      />
                      <button type="button" onClick={handleRemoveClick} className="text-xs text-muted hover:text-wine px-2 transition-colors">
                        Remove
                      </button>
                    </div>

                    <div className="mt-3">
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span className="text-muted">{formatCurrency(spent)} spent</span>
                        <span className="tnum text-muted">{percent}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-hairsoft">
                        <div
                          className={`h-1 rounded-full transition-all ${percent >= 100 ? 'bg-wine' : 'bg-brass'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button disabled={budget.loading} className="rounded-md bg-brass px-5 py-2.5 font-semibold text-ink hover:bg-brass-bright disabled:opacity-50 transition-colors">
              {budget.loading ? 'Saving...' : 'Save Budget'}
            </button>
          </form>
        </section>

        <section className="card p-4 sm:p-6">
          <p className="eyebrow mb-1">Progress</p>
          <h3 className="font-display text-lg text-bone mb-5">This Month</h3>

          <div className="space-y-5">
            <div>
              <p className="eyebrow">Spent</p>
              <p className="font-display text-2xl tnum text-wine mt-1">{formatCurrency(totalExpense)}</p>
            </div>
            <div>
              <p className="eyebrow">Remaining</p>
              <p className={`font-display text-2xl tnum mt-1 ${remaining < 0 ? 'text-wine' : 'text-jade'}`}>
                {formatCurrency(remaining)}
              </p>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-muted">Budget used</span>
                <span className="tnum text-muted">{usedPercent}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-hairsoft">
                <div
                  className={`h-1.5 rounded-full transition-all ${usedPercent >= 100 ? 'bg-wine' : 'bg-denim'}`}
                  style={{ width: `${usedPercent}%` }}
                />
              </div>
            </div>
            {remaining < 0 && (
              <div className="rounded-md border border-wine/40 bg-wine/10 p-3 text-sm text-wine">
                Over budget by {formatCurrency(Math.abs(remaining))}.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Budget
