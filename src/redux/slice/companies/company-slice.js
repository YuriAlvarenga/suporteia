import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../../services/supabase'

// 1. Buscar todas as empresas
export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data
  }
)

// 2. CRIAR nova empresa (O que estava faltando ou mal definido)
export const createCompany = createAsyncThunk(
  'companies/createCompany',
  async (companyName) => {
    const { data, error } = await supabase
      .from('companies')
      .insert([{ name: companyName }])
      .select() // Retorna o item criado para o Redux

    if (error) throw error
    return data[0] // Retorna a primeira (e única) empresa criada
  }
)

const companiesSlice = createSlice({
  name: 'companies',
  initialState: {
    companies: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Companies
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false
        state.companies = action.payload
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      
      // Create Company (Agora a referência existe!)
      .addCase(createCompany.fulfilled, (state, action) => {
        state.companies.push(action.payload)
        // Opcional: Re-ordenar por nome após inserir
        state.companies.sort((a, b) => a.name.localeCompare(b.name))
      })
  },
})

export default companiesSlice.reducer