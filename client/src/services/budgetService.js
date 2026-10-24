import API from './api'

let getBudget = () => API.get('/budget')
let setBudget = (data) => API.post('/budget', data)
let updateBudget = (data) => API.put('/budget', data)

export { getBudget, setBudget, updateBudget }
