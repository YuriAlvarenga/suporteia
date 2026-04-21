import * as React from 'react'
import { AppBar, Tabs, Tab, Box, IconButton, InputBase, Paper } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'



export default function TopBarTicket({ tabValue, setTabValue, countPending, countFinished, onSearch, searchTerm }) {
    const [isFocused, setIsFocused] = React.useState(false)

    const handleTableTicketChange = (_, newValue) => {
        setTabValue(newValue)
    }

    // Limpa o estado no componente pai
    const handleClear = () => {
        onSearch('')
    }

    return (
        <Box sx={{ width: '100%', display: 'flex' }}>
            <AppBar
                position="static"
                color="default"
                elevation={0}
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: 50,
                    px: 2,
                    bgcolor: '#fff',
                }}
            >
                {/* Abas com flexShrink para proteger o texto */}
                <Box sx={{ flexShrink: 0, ml: 1 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTableTicketChange}
                        indicatorColor="primary"
                        textColor="primary"
                        sx={{
                            minHeight: 40,
                            '& .MuiTabs-indicator': { backgroundColor: 'var(--color-highlight)' }
                        }}
                    >
                        <Tab label={`Tickets em Andamento (${countPending || 0})`}
                            sx={{ minHeight: 40, py: 0, fontSize: '0.75rem', '&.Mui-selected': { color: 'var(--color-highlight)', fontWeight: 'bold' } }}
                        />
                        <Tab label={`Tickets Encerrados (${countFinished || 0})`}
                            sx={{ minHeight: 40, py: 0, fontSize: '0.75rem', '&.Mui-selected': { color: 'var(--color-highlight)', fontWeight: 'bold' } }}
                        />
                    </Tabs>
                </Box>

                {/* Container da Busca */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    flexGrow: 1,
                    mr: 1,
                    ml: 1
                }}>
                    <Paper
                        elevation={0}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            maxWidth: '100%',
                            borderRadius: '20px',
                            bgcolor: '#f5f5f5',
                            height: 38,
                            border: isFocused ? '1px solid var(--color-highlight)' : '1px solid #e0e0e0',
                            transition: 'border 0.2s ease-in-out'
                        }}
                    >
                        <IconButton
                            size="small"
                            sx={{
                                color: isFocused ? 'var(--color-highlight)' : 'var(--color-text-inactive)',
                                ml: 0.5,
                                transition: 'color 0.2s ease-in-out'
                            }}
                        >
                            <SearchIcon fontSize="small" />
                        </IconButton>
                        <InputBase
                            placeholder="Buscar ticket ou loja..."
                            value={searchTerm}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChange={(e) => {
                                onSearch(e.target.value)
                            }}
                            sx={{ ml: 1, flex: 1, fontSize: '0.85rem', color: 'var(--color-dark)' }} />
                        {/* Botão sutil de limpar */}
                        {searchTerm && (
                            <IconButton
                                size="small"
                                onClick={handleClear}
                                sx={{ mr: 0.5, color: '#bbb', '&:hover': { color: 'var(--color-highlight)' } }}
                            >
                                <ClearIcon sx={{ fontSize: '1.1rem' }} />
                            </IconButton>
                        )}
                    </Paper>
                </Box>
            </AppBar>
        </Box>
    )
}