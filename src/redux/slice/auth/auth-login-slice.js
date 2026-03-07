import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { supabase } from "../../../services/supabase"

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.log("❌ erro login", error)
      return rejectWithValue(error.message)
    }

    const user = data.user
    if (!user) return rejectWithValue("Usuário não encontrado")

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, role, email')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.log("❌ erro profile", profileError)
      return rejectWithValue(profileError.message)
    }

    const payload = {
      id: user.id,
      email: user.email,
      fullName: profile.full_name,
      role: profile.role
    }

    return payload
  }
)

export const loadUserFromSession = createAsyncThunk(
  "auth/loadUserFromSession",
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.log("❌ erro sessão", error)
      return rejectWithValue(error.message)
    }

    const user = data.session?.user ?? null

    if (!user) return null

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, role, email')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.log("❌ erro profile sessão", profileError)
      return null
    }

    const payload = {
      id: user.id,
      email: user.email,
      fullName: profile.full_name,
      role: profile.role
    }

    return payload
  }
)

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.log("❌ erro logout", error)
      return rejectWithValue(error.message)
    }

    console.log("✅ logout realizado")

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

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.role = null
        state.isAuthenticated = false
        state.error = null
      })
  }
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer