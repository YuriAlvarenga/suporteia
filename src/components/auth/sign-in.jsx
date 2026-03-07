import React, { useState } from "react"
import { Grid, TextField, Box, Button, Typography, Alert } from "@mui/material"
import CircularProgress from '@mui/material/CircularProgress'
import { loginUser, clearError } from '../../redux/slice/auth/auth-login-slice'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux"




export default function SignIn() {

    //controle de estados da página de login
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading, error } = useSelector((state) => state.auth)

    const isDisabled = !(email && password)


    // Validar campos de email e senha
    const frontendValidation = () => {

        let isValid = true

        if (email.trim() === '') {
            setEmailError('Email é obrigatório')
            isValid = false
        } else if (!emailRegex.test(email)) {
            setEmailError('Email inválido')
            isValid = false
        } else {
            setEmailError('')
        }

        if (password.trim() === '') {
            setPasswordError('Senha é obrigatória')
            isValid = false
        } else if (password.length < 6) {
            setPasswordError('A senha deve ter pelo menos 6 caracteres')
            isValid = false
        } else {
            setPasswordError('')
        }

        return isValid
    }


    //Função para enviar dados para o backend e chamar a função de validação do formulário do front

    async function handleSubmit(event) {
        event.preventDefault()
        if (!frontendValidation()) return

        dispatch(loginUser({ email, password }))
            .unwrap()
            .then(() => {
                navigate('/')
            })
            .catch(() => { })
    }

    return (
        <React.Fragment>

            <Grid container sx={{ height: '100vh', margin: 0, padding: 0 }}>
                <Grid item xs={6} sx={{ background: '#7b1616', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '50%' }}>
                    <Box>
                        <Typography sx={{ color: 'white', margin: 0, padding: 0, fontWeight: 'bold' }}>Support Large Accounts -  iFood</Typography>
                    </Box>
                </Grid>

                <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '50%' }}>
                    <Box sx={{ position: 'absolute', bottom: 15 }} >
                        {error && (
                            <Alert severity="error">
                                {typeof error === "string" ? error : JSON.stringify(error)}
                            </Alert>

                        )}
                    </Box>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '80%', maxWidth: 400, p: 3 }}>
                        <Grid container spacing={2}>

                            <TextField
                                margin="normal"
                                variant="standard"
                                required
                                fullWidth
                                id="email"
                                label='Email'
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value)
                                    if (emailError) setEmailError('')
                                    if (error) dispatch(clearError())
                                }}
                                error={!!emailError}
                                helperText={emailError}
                            />

                            <TextField
                                margin="normal"
                                variant="standard"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    if (passwordError) setPasswordError('')
                                    if (error) dispatch(clearError())
                                }}
                                error={!!passwordError}
                                helperText={passwordError}
                            />
                        </Grid>

                        <Box sx={{ mt: 3 }}>
                            {loading ? (
                                <Button type="submit" variant="contained" disabled={(isDisabled)} color="primary" sx={{ fontSize: '0.8rem', background: 'linear-gradient(to right, rgba(255, 5, 5, 0.5) 20%, rgba(79, 75, 75, 0.5) 100%)' }}>
                                    Entrando
                                    <CircularProgress size={20} sx={{ ml: 2, color: '#FFFFFF' }} />
                                </Button>
                            ) : (
                                <Button type="submit" variant="contained" disabled={(isDisabled)} color="primary" sx={{ fontSize: '0.8rem', cursor: 'pointer', background: isDisabled ? 'blue' : 'linear-gradient(to right, rgba(255, 5, 5, 0.5) 20%, rgba(79, 75, 75, 0.5) 100%)' }}>
                                    Entrar
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </React.Fragment>
    )
}
