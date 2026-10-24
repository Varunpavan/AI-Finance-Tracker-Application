let formatCurrency = (value = 0) => {
  return `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

let formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

let categories = [
  'Salary',
  'Freelance',
  'Food',
  'Rent',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Healthcare',
  'Education',
  'Investments',
  'Other'
]

let paymentMethods = ['cash', 'card', 'bank_transfer', 'upi', 'wallet', 'other']

export { formatCurrency, formatDate, categories, paymentMethods }
