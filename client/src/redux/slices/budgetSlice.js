import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as budgetService from '../../services/budgetService'

let getErrorMessage = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message
  }
  return error.message || 'Something went wrong'
}

let fetchBudget = createAsyncThunk('budget/fetch', async (_, thunkAPI) => {
  try {
    let res = await budgetService.getBudget()
    return res.data.data
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

let saveBudget = createAsyncThunk('budget/save', async (formData, thunkAPI) => {
  try {
    let res = await budgetService.setBudget(formData)
    return res.data.data
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

let initialState = {
  monthlyBudget: 0,
  categories: [],
  loading: false,
  error: ''
}

let budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudget.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchBudget.fulfilled, (state, action) => {
        state.loading = false
        state.monthlyBudget = action.payload.monthlyBudget || 0
        state.categories = action.payload.categoryBudgets || []
      })
      .addCase(fetchBudget.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(saveBudget.pending, (state) => {
        state.loading = true
      })
      .addCase(saveBudget.fulfilled, (state, action) => {
        state.loading = false
        state.monthlyBudget = action.payload.monthlyBudget || 0
        state.categories = action.payload.categoryBudgets || []
      })
      .addCase(saveBudget.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export { fetchBudget, saveBudget }
export default budgetSlice.reducer
