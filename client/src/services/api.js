import axios from 'axios'

let API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5055/api',
  withCredentials: true // Automatically sends and receives secure httpOnly cookies
})

// Attach the stored JWT token to outgoing requests if available
API.interceptors.request.use((config) => {
  let token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: automatically renew expired access tokens using the refresh cookie
API.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    let originalRequest = error.config

    // If an API call fails with 401 and hasn't been retried yet
    if (error.response && error.response.status === 401 && originalRequest && !originalRequest._retry) {
      // Avoid looping if the refresh request or login itself failed
      if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        // Request a new access token using the long-lived httpOnly refresh cookie
        let res = await API.post('/auth/refresh')
        let newToken = res.data.token

        if (newToken) {
          localStorage.setItem('token', newToken)
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return API(originalRequest) // Re-run the original request with the fresh token
        }
      } catch (refreshError) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default API
