import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { api } from "../../api/api"



// Thunk para realizar o login
export const loginUser = createAsyncThunk('auth/loginUser', async (loginData, { rejectWithValue }) => {
    try {
        // 1️⃣ cria o cookie
        const response = await api.post('/sign-in', loginData)


        localStorage.setItem('role', response.data.role)
        localStorage.setItem('user', JSON.stringify(response.data))

        // O backend retorna apenas user (sem o token)
        return response.data
    } catch (error) {
        return rejectWithValue(
            error.response?.data?.detail || 'Erro ao realizar login. Verifique suas credenciais'
        )
    }
})


//thunk para deslogar o usuário
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await api.post('/logout')
            localStorage.removeItem('user')
            localStorage.removeItem('role')
            return true
        } catch {
            return rejectWithValue('Erro ao realizar logout')
        }
    }
)



// Slice para autenticação
const loginSlice = createSlice({
    name: 'auth',
    initialState: {
        loading: false,
        user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
        role: localStorage.getItem('role') || null,
        isAuthenticated: !!localStorage.getItem('user'),
        error: ''
    },
    reducers: {
        clearError: (state) => {
            state.error = ""
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true
                state.error = ''
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false
                state.user = action.payload
                state.role = action.payload.role
                state.isAuthenticated = true
                state.error = ''
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload || 'Erro inesperado ao realizar login'
            })



            //logout user
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null
                state.role = null
                state.isAuthenticated = false
                state.loading = false
            })

            .addCase(logoutUser.rejected, (state) => {
                state.user = null
                state.role = null
                state.isAuthenticated = false
                state.loading = false
            })

    }
})

export const { initializeAuth, clearError } = loginSlice.actions
export default loginSlice.reducer