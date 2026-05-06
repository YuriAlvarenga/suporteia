import React, { useState } from "react"
import { Box, Paper, Typography, TextField, Button, Container, InputAdornment, IconButton, Alert } from "@mui/material"
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material"
import { supabase } from "../../services/supabase"
import { useNavigate } from "react-router-dom"


export default function SetPassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: "", message: "" })
  
  const navigate = useNavigate()

  const passwordsMatch = password.length >= 6 && password === confirmPassword

  const handleSetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus({ type: "", message: "" })

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setStatus({ type: "error", message: error.message })
    } else {
      setStatus({ type: "success", message: "Senha definida com sucesso! Redirecionando..." })
      setTimeout(() => navigate("/sign-in"), 3000)
    }
    setLoading(false)
  }

  return (
    <Container maxWidth="xs" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center', borderRadius: 2 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <LockOutlined sx={{ fontSize: 40, color: 'var(--color-highlight)' }} />
        </Box>
        
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Definir sua Senha
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Crie uma senha de pelo menos 6 caracteres para acessar o painel.
        </Typography>

        {status.message && (
          <Alert severity={status.type} sx={{ mb: 2 }}>{status.message}</Alert>
        )}

        <form onSubmit={handleSetPassword}>
          <TextField
            fullWidth
            label="Nova Senha"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Confirmar Senha"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmPassword !== "" && !passwordsMatch}
            helperText={confirmPassword !== "" && !passwordsMatch ? "As senhas não coincidem" : ""}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={!passwordsMatch || loading}
            sx={{ 
              mt: 3, 
              background: 'var(--color-highlight)',
              '&:hover': { background: 'var(--color-highlight)', filter: 'brightness(0.9)' },
              fontWeight: 'bold',
              py: 1.5,
              textTransform: 'none'
            }}
          >
            {loading ? "Salvando..." : "Confirmar Senha"}
          </Button>
        </form>
      </Paper>
    </Container>
  )
}