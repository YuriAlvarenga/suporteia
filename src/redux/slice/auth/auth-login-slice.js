import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { supabase } from "../../../services/supabase"

/* ================================
   LOGIN
================================ */

/* ================================
   LOGIN (Simplificado)
================================ */
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) return rejectWithValue(error.message);

    // ✅ Não precisa buscar o perfil aqui! 
    // O AuthListener vai detectar o login e fazer isso por você.
    return null;
  }
)

/* ================================
   LOGOUT
================================ */

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {

    const { error } = await supabase.auth.signOut()

    if (error) {
      return rejectWithValue(error.message)
    }

    return true
  }
)

/* ================================
   INITIAL STATE
================================ */

const initialState = {
  loading: false,
  loadingSession: true,
  user: null,
  role: null,
  isAuthenticated: false,
  error: null
}

/* ================================
   SLICE
================================ */

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    clearError(state) {
      state.error = null;
    },

    setUser(state, action) {
      state.loadingSession = false;
      const user = action.payload;

      state.user = user || null;
      state.role = user?.role || null;
      state.isAuthenticated = !!user;
    }
  },

  extraReducers: (builder) => {

    builder

      /* LOGIN */

      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state) => {
        // ✅ Apenas paramos o loading do botão. 
        // Não mexemos no state.user aqui, 
        // deixamos o AuthListener/setUser cuidar disso.
        state.loading = false
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      /* LOGOUT */

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