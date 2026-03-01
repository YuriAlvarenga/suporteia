import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { supabase } from "../../../services/supabase"

// 🔑 Thunk para realizar o login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    // 1. Autenticação no Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return rejectWithValue(error.message)

    const user = data.user
    if (!user) return rejectWithValue("Usuário não encontrado")

    // 2. Busca o perfil na tabela 'profiles'
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, role, email')
      .eq('id', user.id)
      .single()

    if (profileError) return rejectWithValue(profileError.message)

    return { 
      id: user.id, 
      email: user.email, 
      fullName: profile.full_name, 
      role: profile.role 
    }
  }
)

// 🔑 Carregar sessão existente
export const loadUserFromSession = createAsyncThunk(
  "auth/loadUserFromSession",
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.getSession()
    if (error) return rejectWithValue(error.message)

    const user = data.session?.user ?? null
    if (!user) return null

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, role, email')
      .eq('id', user.id)
      .single()

    if (profileError) return null

    return { 
      id: user.id, 
      email: user.email, 
      fullName: profile.full_name, 
      role: profile.role 
    }
  }
)

// 🔑 Thunk para deslogar
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    const { error } = await supabase.auth.signOut()
    if (error) return rejectWithValue(error.message)
    return true
  }
)

const initialState = {
  loading: false,
  loadingSession: true,
  user: null,
  role: null,
  isAuthenticated: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
    // Action necessária para o AuthListener sincronizar a sessão
    setUser(state, action) {
      if (action.payload) {
        state.user = action.payload
        state.role = action.payload.role
        state.isAuthenticated = true
      } else {
        state.user = null
        state.role = null
        state.isAuthenticated = false
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.role = action.payload.role
        state.isAuthenticated = !!action.payload
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.user = null
        state.role = null
        state.isAuthenticated = false
        state.error = action.payload
      })

      // LOAD SESSION
      .addCase(loadUserFromSession.pending, (state) => {
        state.loadingSession = true
      })
      .addCase(loadUserFromSession.fulfilled, (state, action) => {
        state.loadingSession = false
        state.user = action.payload
        state.role = action.payload?.role ?? null
        state.isAuthenticated = !!action.payload
      })
      .addCase(loadUserFromSession.rejected, (state) => {
        state.loadingSession = false
        state.user = null
        state.role = null
        state.isAuthenticated = false
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.role = null
        state.isAuthenticated = false
        state.error = null
      })
  }
})

// Exportando as actions agora com o setUser incluído
export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer