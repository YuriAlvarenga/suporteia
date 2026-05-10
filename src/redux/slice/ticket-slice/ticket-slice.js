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

// 📝 Atualizar Observações
export const updateTicketObservation = createAsyncThunk(
  'tickets/updateTicketObservation',
  async ({ id, observacoes }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('chamados')
        .update({ observacoes: observacoes })
        .eq('id', id)
        .select()

      if (error) throw error
      
      if (!data || data.length === 0) {
        throw new Error("Erro ao atualizar observação")
      }

      return data[0] 
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// 🔗 Atualizar Link Associado (NOVO)
export const updateTicketLink = createAsyncThunk(
  'tickets/updateTicketLink',
  async ({ id, link }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('chamados')
        .update({ link: link }) // Coluna 'link' criada no SQL acima
        .eq('id', id)
        .select()

      if (error) throw error
      
      if (!data || data.length === 0) {
        throw new Error("Erro ao atualizar link")
      }

      return data[0] 
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// ✅ Atualizar status do ticket para "Finalizado"
export const updateTicketStatus = createAsyncThunk(
  'tickets/updateTicketStatus',
  async ({ id, status, classificacao, userName, indevido }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('chamados')
        .update({ 
          status: status,
          classificacao: classificacao,
          responsavel: userName,
          is_invalid: indevido          
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

      // Update Observation
      .addCase(updateTicketObservation.fulfilled, (state, action) => {
        const index = state.tickets.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.tickets[index] = action.payload
        }
      })

      // Update Link (Atualiza o ticket na lista local)
      .addCase(updateTicketLink.fulfilled, (state, action) => {
        const index = state.tickets.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.tickets[index] = action.payload
        }
      })

      // Update Status
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
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