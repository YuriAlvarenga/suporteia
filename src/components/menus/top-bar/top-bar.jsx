import React from 'react'
import { AppBar, Grid, Toolbar, Typography, IconButton } from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import { logoutUser } from '../../../redux/slice/auth/auth-login-slice'
import SettingsIcon from '@mui/icons-material/Settings'
import TopBarLogout from './top-bar-logout'



export default function TopBar() {


    //nome do usuário retornado do redux e do backend 
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()

    // data atual
    const dataAtual = new Date()
    const dia = String(dataAtual.getDate()).padStart(2, '0')
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0')
    const ano = dataAtual.getFullYear()

    const dataFormatada = `${dia}/${mes}/${ano}`

    const handleLogout = () => {
        dispatch(logoutUser())
    }

    return (
        <React.Fragment>
            <AppBar position="relative" elevation={0} sx={{ background: 'var(--color-highlight)', border: 'none' }} >
                <Toolbar>
                    <Grid container alignItems="center" justifyContent="space-between" sx={{ fontSize: '0.9rem', width: '100%' }}>
                        <Grid item sx={{ overflow: 'hidden', whiteSpace: 'nowrap', color: 'var(--color-white)'}}>
                            <Typography variant="body1"
                                // Aplica a animação
                                sx={{ animation: 'slide-text 15s linear infinite', display: 'inline-block', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                Atenção: Instabilidade na AWS
                            </Typography>
                        </Grid>
                        <Grid container alignItems="center" spacing={2} sx={{ fontSize: '0.9rem' }}>
                            <TopBarLogout/>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        </React.Fragment>
    )
}
