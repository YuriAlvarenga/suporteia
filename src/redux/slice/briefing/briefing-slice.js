import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../../services/supabase'

// Buscar avisos
export const fetchAvisos = createAsyncThunk('avisos/fetchAvisos', async () => {
  const { data, error } = await supabase
    .from('avisos')
    .select(` *, profiles ( full_name) `) 
    .order('created_at', { ascending: false })
    
  if (error) throw error
  return data
})

// Adicionar aviso
export const addAviso = createAsyncThunk(
  'avisos/addAviso', 
  async (novoAviso, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('avisos')
        .insert([novoAviso])
        .select()

      if (error) throw error 

      return data[0]
    } catch (error) {
      console.error("Erro Supabase:", error.message)
      return rejectWithValue(error.message)
    }
  }
)

// Excluir aviso
export const deleteAviso = createAsyncThunk('avisos/deleteAviso', async (id) => {
  const { error } = await supabase.from('avisos').delete().eq('id', id)
  if (error) throw error
  return id
})

const avisosSlice = createSlice({
  name: 'avisos',
  initialState: { avisos: [], loading: false },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchAvisos.pending, (state) => {
        state.loading = true
      })

      .addCase(fetchAvisos.fulfilled, (state, action) => {
        state.avisos = action.payload
        state.loading = false
      })

      .addCase(fetchAvisos.rejected, (state) => {
        state.loading = false
      })

      .addCase(addAviso.fulfilled, (state, action) => {
        state.avisos.unshift(action.payload)
      })

      .addCase(deleteAviso.fulfilled, (state, action) => {
        state.avisos = state.avisos.filter((a) => a.id !== action.payload)
      })
  }
})

export default avisosSlice.reducer