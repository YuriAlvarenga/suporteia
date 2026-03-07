import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from "../../../services/supabase"

// 🔍 Buscar tickets
export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('chamados')
        .select('*')
        .order('data_abertura', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// ✅ Atualizar status do ticket para "Finalizado" com Classificação e Responsável
export const updateTicketStatus = createAsyncThunk(
  'tickets/updateTicketStatus',
  async ({ id, status, classificacao, userName }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('chamados')
        .update({ 
          status: status,
          classificacao: classificacao,
          responsavel: userName         
        })
        .eq('id', id)
        .select()

      if (error) throw error
      
      if (!data || data.length === 0) {
        throw new Error("Nenhum dado retornado após a atualização")
      }

      return data[0] 
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const ticketsSlice = createSlice({
  name: 'tickets',
  initialState: {
    tickets: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Tickets
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false
        state.tickets = action.payload
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // Update Status
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        // Encontra o ticket na lista e atualiza localmente para refletir na UI sem refresh
        const index = state.tickets.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.tickets[index] = action.payload
        }
      })
      .addCase(updateTicketStatus.rejected, (state, action) => {
        state.error = action.payload
      })
  }
})

export default ticketsSlice.reducer