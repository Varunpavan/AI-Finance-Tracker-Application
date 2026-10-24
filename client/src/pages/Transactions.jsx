import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchTransactions,
  removeTransactionById,
  saveTransaction
} from '../redux/slices/transactionSlice'
import { categories, formatCurrency, formatDate, paymentMethods } from '../utils/format'

let emptyForm = {
  type: 'expense',
  title: '',
  amount: '',
  category: 'Food',
  paymentMethod: 'upi',
  description: '',
  transactionDate: new Date().toISOString().slice(0, 10)
}

let inputClass =
  'w-full bg-surface border border-hairline rounded-md px-3 py-2 text-sm text-bone placeholder:text-muted/60 focus:outline-none focus:border-brass transition-colors'

function Transactions() {
  let dispatch = useDispatch()
  let { transactions, pagination, loading, error } = useSelector((state) => state.transactions)

  const [filters, setFilters] = useState({ search: '', type: '', category: '', sort: 'latest', page: 1 })
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    dispatch(fetchTransactions({ ...filters, limit: 10 }))
  }, [dispatch, filters])

  let updateFilter = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? value : 1
    }))
  }

  let handleSearchChange = (event) => {
    updateFilter('search', event.target.value)
  }

  let handleTypeChange = (event) => {
    updateFilter('type', event.target.value)
  }

  let handleCategoryChange = (event) => {
    updateFilter('category', event.target.value)
  }

  let handleSortChange = (event) => {
    updateFilter('sort', event.target.value)
  }

  let handleResetClick = () => {
    setFilters({ search: '', type: '', category: '', sort: 'latest', page: 1 })
  }

  let handleOpenCreateClick = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  let handleCloseModalClick = () => {
    setShowForm(false)
  }

  let handleEditClick = (item) => {
    setEditingId(item._id)
    setForm({
      type: item.type,
      title: item.title,
      amount: item.amount,
      category: item.category,
      paymentMethod: item.paymentMethod,
      description: item.description || '',
      transactionDate: item.transactionDate?.slice(0, 10) || emptyForm.transactionDate
    })
    setShowForm(true)
  }

  let handleDeleteClick = async (item) => {
    if (!window.confirm(`Delete "${item.title}"?`)) {
      return
    }

    try {
      await dispatch(removeTransactionById(item._id)).unwrap()
      dispatch(fetchTransactions({ ...filters, limit: 10 }))
      setMessage('Transaction deleted.')
    } catch (err) {
      console.log(err)
      setMessage(err || 'Failed to delete transaction.')
    }
  }

  let handleFormSubmit = async (event) => {
    event.preventDefault()
    setMessage('')

    try {
      await dispatch(saveTransaction({ id: editingId, data: form })).unwrap()
      setShowForm(false)
      dispatch(fetchTransactions({ ...filters, limit: 10 }))
      setMessage(editingId ? 'Transaction updated.' : 'Transaction added.')
    } catch (err) {
      console.log(err)
      setMessage(err || 'Unable to save transaction.')
    }
  }

  let handleFormTypeChange = (event) => {
    setForm({ ...form, type: event.target.value })
  }

  let handleFormDateChange = (event) => {
    setForm({ ...form, transactionDate: event.target.value })
  }

  let handleFormTitleChange = (event) => {
    setForm({ ...form, title: event.target.value })
  }

  let handleFormAmountChange = (event) => {
    setForm({ ...form, amount: event.target.value })
  }

  let handleFormCategoryChange = (event) => {
    setForm({ ...form, category: event.target.value })
  }

  let handleFormPaymentChange = (event) => {
    setForm({ ...form, paymentMethod: event.target.value })
  }

  let handleFormDescriptionChange = (event) => {
    setForm({ ...form, description: event.target.value })
  }

  let handlePrevPageClick = () => {
    updateFilter('page', pagination.page - 1)
  }

  let handleNextPageClick = () => {
    updateFilter('page', pagination.page + 1)
  }

  let totalPages = pagination.pages || 1

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow mb-2">Ledger</p>
          <h2 className="font-display text-3xl text-bone">Transactions</h2>
        </div>
        <button
          onClick={handleOpenCreateClick}
          className="rounded-md bg-brass text-ink font-semibold px-4 py-2.5 text-sm hover:bg-brass-bright transition-colors"
        >
          + Add Transaction
        </button>
      </div>

      <section className="card p-4">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={handleSearchChange}
            className={inputClass}
          />
          <select value={filters.type} onChange={handleTypeChange} className={inputClass}>
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={filters.category} onChange={handleCategoryChange} className={inputClass}>
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select value={filters.sort} onChange={handleSortChange} className={inputClass}>
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="amount_asc">Amount: Low to High</option>
          </select>
          <button onClick={handleResetClick} className="rounded-md border border-hairline text-sm text-muted hover:text-bone hover:border-brass/40 transition-colors">
            Reset
          </button>
        </div>
      </section>

      {error && <div className="rounded-md border border-wine/40 bg-wine/10 p-3 text-sm text-wine">{error}</div>}
      {message && !error && (
        <div className="rounded-md border border-jade/40 bg-jade/10 p-3 text-sm text-jade">{message}</div>
      )}

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="eyebrow">
                <th className="px-5 py-3 font-normal">Title</th>
                <th className="px-5 py-3 font-normal">Type</th>
                <th className="px-5 py-3 font-normal">Category</th>
                <th className="px-5 py-3 font-normal">Date</th>
                <th className="px-5 py-3 font-normal">Payment</th>
                <th className="px-5 py-3 font-normal text-right">Amount</th>
                <th className="px-5 py-3 font-normal"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairsoft">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted">Loading...</td>
                </tr>
              )}

              {!loading && transactions.length > 0 &&
                transactions.map((item) => (
                  <tr key={item._id} className="hover:bg-hairsoft/40 transition-colors">
                    <td className="px-5 py-3.5 text-bone">{item.title}</td>
                    <td className="px-5 py-3.5 capitalize text-muted">{item.type}</td>
                    <td className="px-5 py-3.5 text-muted">{item.category}</td>
                    <td className="px-5 py-3.5 text-muted">{formatDate(item.transactionDate)}</td>
                    <td className="px-5 py-3.5 capitalize text-muted">{item.paymentMethod?.replace('_', ' ')}</td>
                    <td className={`px-5 py-3.5 text-right tnum font-medium ${item.type === 'income' ? 'text-jade' : 'text-wine'}`}>
                      {item.type === 'income' ? '+' : '−'}{formatCurrency(item.amount)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-3 text-xs">
                        <button onClick={() => handleEditClick(item)} className="text-muted hover:text-brass transition-colors">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteClick(item)} className="text-muted hover:text-wine transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-muted">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-hairline px-5 py-3 text-sm">
          <span className="eyebrow">Page {pagination.page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={handlePrevPageClick}
              className="rounded-md border border-hairline px-3 py-1.5 text-muted hover:text-bone disabled:opacity-30 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= totalPages}
              onClick={handleNextPageClick}
              className="rounded-md border border-hairline px-3 py-1.5 text-muted hover:text-bone disabled:opacity-30 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-lg border border-hairline bg-surface p-4 sm:p-6 shadow-card max-h-[90vh] overflow-y-auto">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="eyebrow mb-1">{editingId ? 'Edit entry' : 'New entry'}</p>
                <h3 className="font-display text-xl text-bone">
                  {editingId ? 'Edit Transaction' : 'Add Transaction'}
                </h3>
              </div>
              <button onClick={handleCloseModalClick} className="text-muted hover:text-bone">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select value={form.type} onChange={handleFormTypeChange} className={inputClass}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <input
                  type="date"
                  value={form.transactionDate}
                  onChange={handleFormDateChange}
                  className={inputClass}
                  required
                />
              </div>

              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={handleFormTitleChange}
                className={inputClass}
                required
              />

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Amount"
                value={form.amount}
                onChange={handleFormAmountChange}
                className={inputClass}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select value={form.category} onChange={handleFormCategoryChange} className={inputClass}>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select value={form.paymentMethod} onChange={handleFormPaymentChange} className={inputClass}>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>{method.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={handleFormDescriptionChange}
                className={inputClass}
                rows={2}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-brass py-2.5 font-semibold text-ink hover:bg-brass-bright disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Save Transaction'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Transactions
