import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from "../../../services/supabase"

// 🔍 Buscar Alertas
export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAlerts',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('ticket_alerts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const createAlert = createAsyncThunk(
  'alerts/createAlert',
  async (newAlert, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('ticket_alerts')
        .insert([
          {
            group_id: newAlert.group_id,     
            group_name: newAlert.group_name, 
            store_name: newAlert.store_name,
            tag: newAlert.tag,
            action_type: newAlert.action_type 
          }
        ])
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

// 🗑️ Deletar Alerta
export const deleteAlert = createAsyncThunk(
  'alerts/deleteAlert',
  async (alertId, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('ticket_alerts')
        .delete()
        .eq('id', alertId)

      if (error) throw error
      return alertId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const alertSlice = createSlice({
  name: 'alerts',
  initialState: {
    monitoredStores: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.loading = false
        state.monitoredStores = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createAlert.fulfilled, (state, action) => {
        state.monitoredStores.unshift(action.payload)
      })
      .addCase(deleteAlert.fulfilled, (state, action) => {
        state.monitoredStores = state.monitoredStores.filter(a => a.id !== action.payload)
      })
  }
})

export default alertSlice.reducer