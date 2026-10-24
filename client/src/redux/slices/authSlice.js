import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as authService from '../../services/authService'

let getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  if (error.response?.status === 429) {
    return 'Too many requests. Please wait a few moments and try again.'
  }
  return error.message || 'Something went wrong'
}

let loginUser = createAsyncThunk('auth/login', async (formData, thunkAPI) => {
  try {
    let res = await authService.login(formData)
    return res.data
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

let signupUser = createAsyncThunk('auth/signup', async (formData, thunkAPI) => {
  try {
    let res = await authService.signup(formData)
    return res.data
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

let refreshUser = createAsyncThunk('auth/me', async (_, thunkAPI) => {
  try {
    let res = await authService.getMe()
    return res.data.user
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

let updateProfileThunk = createAsyncThunk('auth/updateProfile', async (formData, thunkAPI) => {
  try {
    let res = await authService.updateProfile(formData)
    return res.data.user
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

let deleteAccountThunk = createAsyncThunk('auth/deleteAccount', async (_, thunkAPI) => {
  try {
    let res = await authService.deleteAccount()
    return res.data
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

// Check if user session already exists in localStorage
let savedUser = null
let rawUser = localStorage.getItem('user')
if (rawUser) {
  try {
    savedUser = JSON.parse(rawUser)
  } catch (error) {
    localStorage.removeItem('user')
  }
}

let initialState = {
  user: savedUser,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: '',
  isAuthenticated: !!localStorage.getItem('token')
}

let authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = ''
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(signupUser.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(refreshUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
      .addCase(refreshUser.rejected, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      })

      .addCase(updateProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload
        localStorage.setItem('user', JSON.stringify(action.payload))
      })

      .addCase(deleteAccountThunk.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      })
  }
})

let { logout } = authSlice.actions

export { loginUser, signupUser, refreshUser, updateProfileThunk, deleteAccountThunk, logout }
export default authSlice.reducer
