import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as transactionService from '../../services/transactionService'

let getErrorMessage = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message
  }
  return error.message || 'Something went wrong'
}

let fetchTransactions = createAsyncThunk('transactions/fetch', async (params, thunkAPI) => {
  try {
    let res = await transactionService.getTransactions(params)
    return res.data
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

let saveTransaction = createAsyncThunk('transactions/save', async ({ id, data }, thunkAPI) => {
  try {
    let res = null
    if (id) {
      res = await transactionService.updateTransaction(id, data)
    } else {
      res = await transactionService.createTransaction(data)
    }
    return res.data.data
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

let removeTransactionById = createAsyncThunk('transactions/delete', async (id, thunkAPI) => {
  try {
    await transactionService.deleteTransaction(id)
    return id
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

let initialState = {
  transactions: [],
  pagination: { page: 1, limit: 10, total: 0, pages: 1 },
  loading: false,
  error: ''
}

let transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.transactions = action.payload.data
        state.pagination = action.payload.pagination
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(saveTransaction.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(saveTransaction.fulfilled, (state, action) => {
        state.loading = false

        let existingIndex = state.transactions.findIndex((t) => t._id === action.payload._id)
        if (existingIndex === -1) {
          state.transactions.unshift(action.payload)
        } else {
          state.transactions[existingIndex] = action.payload
        }
      })
      .addCase(saveTransaction.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(removeTransactionById.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter((t) => t._id !== action.payload)
      })
  }
})

export { fetchTransactions, saveTransaction, removeTransactionById }
export default transactionSlice.reducer
