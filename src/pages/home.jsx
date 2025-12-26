import React, { useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import TopBar from '../components/menus/top-bar/top-bar'
import SideBar from '../components/menus/side-bar/side-bar'
import { Outlet } from 'react-router-dom'
import OpenManualTicket from '../components/open-manual-ticket/open-manual-ticket'

import customTheme from '../theme/theme'
import TopBarTicket from '../components/menus/top-bar/top-bar-tickets'


export default function Home() {

  //criarChamadoManutal (newTicket)
  const [newTicket, setValueNewTicket] = useState(false)
  const handleClick = () => {
    setValueNewTicket(!newTicket)
  }

  const [showTopBarTicket, setShowTopBarTicket] = useState(false)
   const handleItemSelect = (childName) => {
    // verifica se o item clicado pertence à categoria "Chamados"
    const chamadosItems = ['Bobs','Giraffas','Trigo','Mania de Churrasco','American Burger','Juicestreet']
    setShowTopBarTicket(chamadosItems.includes(childName))
  }

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ display: 'flex', height: '100vh', background: 'var(--color-white)' }}>
        <CssBaseline />

        <Box component="nav" sx={{ width: { sm: 200 }, flexShrink: { sm: 0 } }}>
          <SideBar sx={{ display: { sm: 'block', xs: 'none' } }} newTicket={newTicket} handleClick={handleClick} onItemSelect={handleItemSelect} />
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TopBar />
          {showTopBarTicket && <TopBarTicket />} {/* renderiza condicionalmente */}
          <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
            <Outlet /> {/* Renderiza o conteúdo das rotas filhas */}
            {newTicket && <OpenManualTicket open={newTicket} onClose={handleClick} />}
          </Box>
        </Box>

      </Box>
    </ThemeProvider>
  )
}