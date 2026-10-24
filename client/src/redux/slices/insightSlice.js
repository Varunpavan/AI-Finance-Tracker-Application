import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as aiService from '../../services/aiService'

let getErrorMessage = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message
  }
  return error.message || 'Something went wrong'
}

let fetchInsights = createAsyncThunk('insights/fetch', async (_, thunkAPI) => {
  try {
    let res = await aiService.generateInsights()
    return res.data.data
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

let fetchPrediction = createAsyncThunk('insights/predict', async (_, thunkAPI) => {
  try {
    let res = await aiService.predictSpending()
    return res.data.data
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error))
  }
})

let initialState = {
  insights: [],
  predictions: {},
  provider: '',
  loading: false,
  error: ''
}

let insightSlice = createSlice({
  name: 'insights',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInsights.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchInsights.fulfilled, (state, action) => {
        state.loading = false
        state.insights = action.payload.insights || []
        state.provider = action.payload.provider || 'heuristic'
      })
      .addCase(fetchInsights.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      .addCase(fetchPrediction.fulfilled, (state, action) => {
        state.predictions = action.payload
      })
  }
})

export { fetchInsights, fetchPrediction }
export default insightSlice.reducer
