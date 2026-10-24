import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchInsights, fetchPrediction } from '../redux/slices/insightSlice'
import { formatCurrency } from '../utils/format'

function Insights() {
  let dispatch = useDispatch()
  let { insights, predictions, provider, loading, error } = useSelector((state) => state.insights)

  useEffect(() => {
    dispatch(fetchInsights())
    dispatch(fetchPrediction())
  }, [dispatch])

  let handleRefreshClick = () => {
    dispatch(fetchInsights())
    dispatch(fetchPrediction())
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-2">Analysis</p>
          <h2 className="font-display text-3xl text-bone">AI Insights</h2>
        </div>
        <button
          onClick={handleRefreshClick}
          className="rounded-md border border-hairline px-4 py-2.5 text-sm text-bone hover:border-brass/40 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && <div className="rounded-md border border-wine/40 bg-wine/10 p-3 text-sm text-wine">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="card p-4 sm:p-6 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="eyebrow mb-1">Readout</p>
              <h3 className="font-display text-lg text-bone">Recommendations</h3>
            </div>
            <span className="eyebrow border border-hairline rounded-full px-3 py-1">
              {provider || 'heuristic'}
            </span>
          </div>

          {loading && <p className="text-sm text-muted">Generating insights...</p>}

          {!loading && (
            <div className="divide-y divide-hairsoft">
              {insights.length > 0 &&
                insights.map((item, index) => (
                  <div key={`${item}-${index}`} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    <span className="font-display text-brass/60 text-sm mt-0.5">{String(index + 1).padStart(2, '0')}</span>
                    <p className="text-sm text-bone/90 leading-relaxed">{item}</p>
                  </div>
                ))}

              {insights.length === 0 && (
                <p className="text-sm text-muted py-4">Add transactions to generate insights.</p>
              )}
            </div>
          )}
        </section>

        <section className="card p-4 sm:p-6">
          <p className="eyebrow mb-1">Forecast</p>
          <h3 className="font-display text-lg text-bone mb-5">Spending Prediction</h3>

          <div className="space-y-5">
            <div>
              <p className="eyebrow">Predicted Expense</p>
              <p className="font-display text-3xl tnum text-bone mt-1">{formatCurrency(predictions.predictedExpense || 0)}</p>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-muted">Confidence</span>
                <span className="tnum text-muted">{predictions.confidence || 0}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-hairsoft">
                <div className="h-1.5 rounded-full bg-jade transition-all" style={{ width: `${predictions.confidence || 0}%` }} />
              </div>
            </div>
            {predictions.budgetRisk && (
              <div className="rounded-md border border-brass/40 bg-brass/10 p-3 text-sm text-brass-bright">
                Predicted spending is above your monthly budget.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Insights
