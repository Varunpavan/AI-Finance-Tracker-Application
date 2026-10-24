import API from './api'

let signup = (data) => API.post('/auth/signup', data)
let login = (data) => API.post('/auth/login', data)
let refreshToken = () => API.post('/auth/refresh')
let logoutServer = () => API.post('/auth/logout')
let getMe = () => API.get('/auth/me')
let updateProfile = (data) => API.put('/auth/profile', data)
let changePassword = (data) => API.put('/auth/password', data)
let getAccountStats = () => API.get('/auth/stats')
let deleteAccount = () => API.delete('/auth/account')

export {
  signup,
  login,
  refreshToken,
  logoutServer,
  getMe,
  updateProfile,
  changePassword,
  getAccountStats,
  deleteAccount
}
