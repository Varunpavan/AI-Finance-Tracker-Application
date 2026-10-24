import API from './api'

let getDashboardSummary = () => API.get('/dashboard/summary')

export { getDashboardSummary }
