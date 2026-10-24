import API from './api'

let generateInsights = () => API.post('/ai/insights')
let predictSpending = () => API.post('/ai/predict')

export { generateInsights, predictSpending }
