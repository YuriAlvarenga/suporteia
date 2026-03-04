import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { createClient } from "@supabase/supabase-js"
import { supabase } from "../../../services/supabase"

// Configuração do cliente temporário para evitar deslogar o admin
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
})

// 🔑 EXPORT 1: Buscar perfis
export const fetchProfiles = createAsyncThunk(
  'users/fetchProfiles',
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('full_name', { ascending: true })

    if (error) return rejectWithValue(error.message)
    return data
  }
)

// 🔑 EXPORT 2: Criar usuário (Sem deslogar o admin)
export const createNewUser = createAsyncThunk(
  'users/createNewUser',
  async ({ email, password, fullName, role }, { rejectWithValue, dispatch }) => {
    const { data, error: authError } = await tempSupabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    })

    if (authError) return rejectWithValue(authError.message)

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName, role: role })
        .eq('id', data.user.id)

      if (profileError) return rejectWithValue(profileError.message)
    }

    dispatch(fetchProfiles())
    return true
  }
)

// 🔑 EXPORT 3: Atualizar perfil (O que estava dando erro)
export const updateProfile = createAsyncThunk(
  'users/updateProfile',
  async ({ id, full_name, role }, { rejectWithValue, dispatch }) => {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name, role })
      .eq('id', id)

    if (error) return rejectWithValue(error.message)
    dispatch(fetchProfiles())
    return true
  }
)

// 🔑 EXPORT 4: Deletar perfil
export const deleteProfile = createAsyncThunk(
  'users/deleteProfile',
  async (id, { rejectWithValue, dispatch }) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) return rejectWithValue(error.message)
    dispatch(fetchProfiles())
    return true
  }
)

const userSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    loading: false,
    initialFetchLoading: false,
    error: null,
    success: false
  },
  reducers: {
    resetStatus: (state) => {
      state.error = null
      state.success = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfiles.pending, (state) => { state.initialFetchLoading = true })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.initialFetchLoading = false
        state.list = action.payload || []
      })
      .addCase(fetchProfiles.rejected, (state) => { state.initialFetchLoading = false })
      
      .addCase(createNewUser.pending, (state) => { state.loading = true; state.error = null; state.success = false })
      .addCase(createNewUser.fulfilled, (state) => {
        state.loading = false
        state.success = true
      })
      .addCase(createNewUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { resetStatus } = userSlice.actions
export default userSlice.reducer