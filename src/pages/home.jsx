import React, { useState, useEffect } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import TopBar from '../components/menus/top-bar/top-bar'
import SideBar from '../components/menus/side-bar/side-bar'
import { Outlet } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import customTheme from '../theme/theme'
import TopBarTicket from '../components/menus/top-bar/top-bar-tickets'


export default function Home() {

  const [tabValue, setTabValue] = React.useState(0)
  const [counts, setCounts] = React.useState({ pending: 0, finished: 0 })

  //Barra de pesquisa
  const [searchTerm, setSearchTerm] = useState("")

  //criar novo grupo de empresa (newCompanyGroup)
  const [newCompanyGroup, setValueNewCompanyGroup] = useState(false)
  const handleClickNewGroup = () => {
    setValueNewCompanyGroup(!newCompanyGroup)
  }

  //criarChamadoManual (newTicket)
  const [newTicket, setValueNewTicket] = useState(false)
  const handleClick = () => {
    setValueNewTicket(!newTicket)
  }

  const location = useLocation()
  const [showTopBarTicket, setShowTopBarTicket] = useState(false)

  useEffect(() => {
    setShowTopBarTicket(location.pathname.startsWith('/tickets'))
  }, [location.pathname])


  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ display: 'flex', height: '100vh', background: 'var(--color-white)' }}>
        <CssBaseline />

        <Box component="nav" sx={{ width: { sm: 200 }, flexShrink: { sm: 0 } }}>
          <SideBar sx={{ display: { sm: 'block', xs: 'none' } }} handleClickNewGroup={handleClickNewGroup} />
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TopBar />
          {showTopBarTicket && <TopBarTicket handleClick={handleClick} onSearch={(val) => setSearchTerm(val)} tabValue={tabValue} setTabValue={setTabValue} countPending={counts.pending} countFinished={counts.finished} />} {/* renderiza condicionalmente */}
          <Box sx={{ p: 2, flexGrow: 1, overflow: 'auto' }}>
            <Outlet context={{ tabValue, setCounts, searchTerm }} /> {/* Renderiza o conteúdo das rotas filhas */}
          </Box>
        </Box>

      </Box>
    </ThemeProvider>
  )
}