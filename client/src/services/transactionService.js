import API from './api'

let getTransactions = (params) => API.get('/transactions', { params })
let createTransaction = (data) => API.post('/transactions', data)
let updateTransaction = (id, data) => API.put(`/transactions/${id}`, data)
let deleteTransaction = (id) => API.delete(`/transactions/${id}`)

export {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
}
