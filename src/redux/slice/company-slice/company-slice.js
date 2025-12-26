import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { api } from "../../api/api"

// GET: buscar todas as companies
export const allCompanies = createAsyncThunk(
  'companies/allCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/companies-groups')
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message)
    }
  }
)

// POST: criar nova company
export const createCompany = createAsyncThunk(
  'companies/createCompany',
  async (companyData, { rejectWithValue }) => {
    try {
      const response = await api.post('/companies-groups', companyData)
      return response.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.detail || err.message)
    }
  }
)

const companySlice = createSlice({
  name: 'companies',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET allCompanies
      .addCase(allCompanies.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(allCompanies.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(allCompanies.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // POST createCompany
      .addCase(createCompany.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.loading = false
        // adiciona o novo item na lista para atualizar UI imediatamente
        state.list.push(action.payload)
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export default companySlice.reducer
