
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from "../../../services/supabase"



//  Buscar tickets
export const fetchTickets = createAsyncThunk(
  'tickets/fetchTickets',
  async () => {
    const { data, error } = await supabase
      .from('chamados')
      .select('*')
      .order('data_abertura', { ascending: false })

    if (error) throw error
    

    return data
  }
)

//Atualizar status do ticket para "Finalizado"
export const updateTicketStatus = createAsyncThunk(
  'tickets/updateTicketStatus',
  async ({ id, status }) => {
    const { data, error } = await supabase
      .from('chamados')
      .update({ status: status })
      .eq('id', id)
      .select()

    if (error) throw error
    return data[0] 
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
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false
        state.tickets = action.payload
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      // Update Status
      .addCase(updateTicketStatus.fulfilled, (state, action) => {
        // Encontra o ticket na lista e atualiza o status localmente
        const index = state.tickets.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.tickets[index] = action.payload
        }
      })
  }
})


export default ticketsSlice.reducer
