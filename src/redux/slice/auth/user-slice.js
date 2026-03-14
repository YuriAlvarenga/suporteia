import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { supabase } from "../../../services/supabase"


/* ======================================================
   FETCH PROFILES
====================================================== */
export const fetchProfiles = createAsyncThunk(
  "users/fetchProfiles",
  async (_, { rejectWithValue }) => {

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true })

    if (error) {
      console.error("❌ Erro fetchProfiles:", error)
      return rejectWithValue(error.message)
    }

    return data ?? []
  }
)

/* ======================================================
   CREATE USER
====================================================== */
export const createNewUser = createAsyncThunk(
  "users/createNewUser",
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

    if (authError) {
      console.error("❌ Erro auth:", authError)
      return rejectWithValue(authError.message)
    }

    if (data.user) {

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          role: role
        })
        .eq("id", data.user.id)

      if (profileError) {
        return rejectWithValue(profileError.message)
      }
    }

    await dispatch(fetchProfiles())
    return true
  }
)

/* ======================================================
   UPDATE PROFILE
====================================================== */
export const updateProfile = createAsyncThunk(
  "users/updateProfile",
  async ({ id, full_name, role }, { rejectWithValue, dispatch }) => {

    const { error } = await supabase
      .from("profiles")
      .update({ full_name, role })
      .eq("id", id)

    if (error) {
      console.error("❌ Erro update:", error)
      return rejectWithValue(error.message)
    }

    await dispatch(fetchProfiles())
    return true
  }
)

/* ======================================================
   DELETE PROFILE
====================================================== */
export const deleteProfile = createAsyncThunk(
  "users/deleteProfile",
  async (id, { rejectWithValue, dispatch }) => {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("❌ Erro delete:", error)
      return rejectWithValue(error.message)
    }

    await dispatch(fetchProfiles())
    return true
  }
)

/* ======================================================
   SLICE
====================================================== */

const userSlice = createSlice({
  name: "users",

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
      /* FETCH USERS */
      .addCase(fetchProfiles.pending, (state) => {
        state.error = null

        // só mostra skeleton se ainda não carregou nada
        if (state.list.length === 0) {
          state.initialFetchLoading = true
        }
      })

      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.initialFetchLoading = false
        state.list = action.payload ?? []
      })

      .addCase(fetchProfiles.rejected, (state, action) => {
        state.initialFetchLoading = false
        state.error = action.payload
      })

      /* CREATE USER */
      .addCase(createNewUser.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })

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