import * as React from 'react'
import { Box, Avatar, Menu, MenuItem, ListItemIcon, Divider, IconButton, Tooltip, Typography } from '@mui/material'
import { PersonAdd, Settings, Logout } from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../../redux/slice/auth/auth-login-slice'
import { useNavigate } from 'react-router-dom'

export default function TopBarLogout() {
    const [anchorEl, setAnchorEl] = React.useState(null)
    const open = Boolean(anchorEl)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    // Buscando os dados do usuário logado no Redux
    const { user } = useSelector((state) => state.auth || {})

    // Lógica para pegar a inicial do nome
    const getUserInitial = () => {
        if (user?.fullName) {
            return user.fullName.charAt(0).toUpperCase()
        }
        return 'U' // Fallback caso o nome não exista
    }

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleAddAccount = () => {
        handleClose()
        navigate('/sign-up')
    }

    const handleLogout = async () => {
        try {
            await dispatch(logoutUser()).unwrap()
            localStorage.removeItem('activeMenuItem') 
            navigate('/sign-in')
        } catch (err) {
            console.error('Erro ao deslogar:', err)
        }
    }

    return (
        <React.Fragment>
            <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
                <Tooltip title="Configurações de Conta">
                    <IconButton 
                        onClick={handleClick} 
                        size="small" 
                        sx={{ ml: 2 }} 
                        aria-controls={open ? 'account-menu' : undefined} 
                        aria-haspopup="true" 
                        aria-expanded={open ? 'true' : undefined}
                    >
                        {/* AQUI: Renderizando a inicial dinâmica */}
                        <Avatar sx={{ width: 32, height: 32, color: 'var(--color-highlight)', bgcolor: 'var(--color-background)' }}>
                            {getUserInitial()}
                        </Avatar>
                    </IconButton>
                </Tooltip>
            </Box>

            <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            overflow: 'visible',
                            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                            mt: 1.5,
                            '& .MuiAvatar-root': {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                            '&::before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: 0,
                                right: 14,
                                width: 10,
                                height: 10,
                                bgcolor: 'background.paper',
                                transform: 'translateY(-50%) rotate(45deg)',
                                zIndex: 0,
                            },
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleClose}>
                    <Avatar sx={{ bgcolor: 'var(--color-highlight)' }}>{getUserInitial()}</Avatar> 
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {user?.fullName || 'Usuário'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {user?.role === 'admin' ? 'Administrador' : 'Analista'}
                        </Typography>
                    </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleAddAccount}>
                    <ListItemIcon>
                        <PersonAdd fontSize="small" />
                    </ListItemIcon>
                    Adicionar Usuário
                </MenuItem>
                <MenuItem onClick={handleClose}>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Configurações
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <Logout fontSize="small" color="var(--color-highlight)" />
                    </ListItemIcon>
                    <Typography color="error">Sair</Typography>
                </MenuItem>
            </Menu>
        </React.Fragment>
    )
}