import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { supabase } from "../../../services/supabase"

/* ================================
   LOGIN
================================ */

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return rejectWithValue(error.message)
    }

    const user = data.user

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, role, email")
      .eq("id", user.id)
      .single()

    if (profileError) {
      return rejectWithValue(profileError.message)
    }

    return {
      id: user.id,
      email: user.email,
      fullName: profile.full_name,
      role: profile.role
    }
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
  loadingSession: false,
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

      .addCase(loginUser.fulfilled, (state, action) => {

        state.loading = false
        state.user = action.payload
        state.role = action.payload.role
        state.isAuthenticated = true
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