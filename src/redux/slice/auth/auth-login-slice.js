import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { supabase } from "../../../services/supabase"

/* ================================
   LOGIN
================================ */

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return rejectWithValue(error.message)
    }

    return true
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
      state.error = null
    },

    setUser(state, action) {

      state.loadingSession = false

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

      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
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