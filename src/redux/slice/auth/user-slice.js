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
      return rejectWithValue(error.message)
    }

    return data ?? []
  }
)

export const inviteNewUser = createAsyncThunk(
  "users/inviteNewUser",
  async ({ email, fullName, role }, { rejectWithValue, dispatch }) => {
    try {
      // O supabase.functions.invoke chama o código que está lá na nuvem do Supabase
      const { data, error } = await supabase.functions.invoke('hyper-responder', {
        body: { email, fullName, role }
      })

      if (error) throw new Error(error.message || "Erro ao convidar usuário")

      // Atualiza a lista de perfis
      await dispatch(fetchProfiles())
      return true
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

/* ======================================================
   UPDATE PROFILE
====================================================== */
export const updateProfile = createAsyncThunk(
  "users/updateProfile",
  async ({ id, full_name, role }, { rejectWithValue, dispatch, getState }) => {

    const { error } = await supabase
      .from("profiles")
      .update({ full_name, role })
      .eq("id", id)

    if (error) {
      return rejectWithValue(error.message)
    }

    // pega usuário logado
    const currentUser = getState().auth.user

    if (currentUser?.id === id) {

      dispatch(setUser({
        ...currentUser,
        fullName: full_name,
        role: role
      }))

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
        if (state.list.length === 0) state.initialFetchLoading = true
      })
      .addCase(fetchProfiles.fulfilled, (state, action) => {
        state.initialFetchLoading = false
        state.list = action.payload ?? []
      })
      .addCase(fetchProfiles.rejected, (state, action) => {
        state.initialFetchLoading = false
        state.error = action.payload
      })

      /* INVITE USER (Ajustado para o novo nome da action) */
      .addCase(inviteNewUser.pending, (state) => {
        state.loading = true
        state.error = null
        state.success = false
      })
      .addCase(inviteNewUser.fulfilled, (state) => {
        state.loading = false
        state.success = true
      })
      .addCase(inviteNewUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { resetStatus } = userSlice.actions
export default userSlice.reducer