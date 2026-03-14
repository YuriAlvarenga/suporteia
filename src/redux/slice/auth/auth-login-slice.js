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
   LOCAL STORAGE
================================ */

const storedUser = localStorage.getItem("authUser")

const parsedUser = storedUser ? JSON.parse(storedUser) : null

/* ================================
   INITIAL STATE
================================ */

const initialState = {
  loading: false,
  user: parsedUser,
  role: parsedUser?.role || null,
  isAuthenticated: !!parsedUser,
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

      if (action.payload) {

        state.user = action.payload
        state.role = action.payload.role
        state.isAuthenticated = true

        localStorage.setItem(
          "authUser",
          JSON.stringify(action.payload)
        )

      } else {

        state.user = null
        state.role = null
        state.isAuthenticated = false

        localStorage.removeItem("authUser")

      }
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

        localStorage.setItem(
          "authUser",
          JSON.stringify(action.payload)
        )
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

        localStorage.removeItem("authUser")
      })
  }
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer