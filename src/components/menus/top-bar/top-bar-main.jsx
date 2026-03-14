import * as React from 'react'
import { Box, Avatar, Menu, MenuItem, ListItemIcon, Divider, IconButton, Tooltip, Typography } from '@mui/material'
import { PersonAdd, Settings, Logout } from '@mui/icons-material'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../../redux/slice/auth/auth-login-slice'
import { useNavigate, useLocation } from 'react-router-dom'

export default function TopBarLogout() {

  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user } = useSelector((state) => state.auth)

  const location = useLocation()

  const getTitle = () => {

    if (location.pathname === "/") return "Home"

    if (location.pathname.startsWith("/board-briefing"))
      return "Briefing"

    if (location.pathname.startsWith("/tickets"))
      return "Chamados"

    if (location.pathname.startsWith("/sign-up"))
      return "Usuários"

    return "Home"
  }

  const getUserInitial = () => {
    if (user?.fullName) {
      return user.fullName.charAt(0).toUpperCase()
    }
    return ''
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
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>

        <Typography sx={{ fontWeight: 'bold' }}>
          {getTitle()}
        </Typography>

        <Tooltip title="Configurações de Conta">
          <IconButton onClick={handleClick} size="small" sx={{ ml: 2 }}>
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
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >

        <MenuItem>

          <Avatar sx={{ bgcolor: 'var(--color-highlight)' }}>
            {getUserInitial()}
          </Avatar>

          <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>

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
            <Logout fontSize="small" />
          </ListItemIcon>
          <Typography color="error">Sair</Typography>
        </MenuItem>

      </Menu>
    </>
  )
}