import React, { useState } from 'react'
import { Box, Grid, Typography, Stack, Paper, Tooltip, IconButton, ToggleButtonGroup, ToggleButton, MenuItem, Select, FormControl } from '@mui/material'
import { useSelector } from 'react-redux'
import TicketTemperatureCards from './dash-temperature-cards'
import TicketClassificationList from './dash-classification-tickets-list'
import RepeatOffenderTickets from './repeat-offenders-tickets'
import FilterListIcon from '@mui/icons-material/FilterList'
import FilterListOffIcon from '@mui/icons-material/FilterListOff'
import AddAlertIcon from '@mui/icons-material/AddAlert'
import CreateAlertModal from './create-alert-modal'

export default function DashboardTickets() {
    const { companies } = useSelector((state) => state.companies)
    
    const [openFilters, setOpenFilters] = useState(false)
    const [openAlertModal, setOpenAlertModal] = useState(false)
    const [showAlertPanel, setShowAlertPanel] = useState(false)
    const [monitoredStores, setMonitoredStores] = useState([])

    // Novos estados para os filtros da lista de tags
    const [tagRange, setTagRange] = useState(7)
    const [tagGroup, setTagGroup] = useState('todos')

    const handleAddAlert = (newAlert) => {
        setMonitoredStores((prev) => [...prev, newAlert])
        setShowAlertPanel(true)
    }

    return (
        <Box sx={{ p: 1 }}>
            <style>
                {`
                @keyframes borderBlink {
                    0% { border-left-color: 'var(--color-highlight)';}
                    50% { border-left-color: #ff174411; }
                    100% { border-left-color:  'var(--color-highlight)';}
                }
                `}
            </style>

            <Grid container spacing={2}>
                <Grid item xs={12} md={8} lg={9}>
                    <Stack spacing={2}>
                        <Paper elevation={3} sx={{ borderRadius: 1, overflow: 'hidden' }}>
                            <Box sx={{ p: 1, bgcolor: '#fff', borderBottom: '1px solid #eee' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    Temperatura
                                </Typography>
                            </Box>
                            <TicketTemperatureCards />
                        </Paper>

                        <Paper elevation={3} sx={{ borderRadius: 1, overflow: 'hidden', minHeight: '450px' }}>
                            <Box sx={{ p: 1, bgcolor: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    Casos Reincidentes
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Tooltip title="Criar Alerta de Loja">
                                        <IconButton 
                                            size="small" 
                                            onClick={() => setShowAlertPanel(!showAlertPanel)} 
                                            sx={{ color: showAlertPanel ? 'var(--color-highlight)' : '#1976d2' }}
                                        >
                                            <AddAlertIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={openFilters ? "Fechar Filtros" : "Abrir Filtros"}>
                                        <IconButton 
                                            size="small" 
                                            onClick={() => setOpenFilters(!openFilters)} 
                                            sx={{ color: openFilters ? 'var(--color-highlight)' : '#1976d2' }}
                                        >
                                            {openFilters ? <FilterListOffIcon fontSize="small" /> : <FilterListIcon fontSize="small" />}
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Box>
                            <RepeatOffenderTickets
                                showFilters={openFilters}
                                showAlerts={showAlertPanel}
                                monitoredStores={monitoredStores}
                                onOpenModal={() => setOpenAlertModal(true)}
                            />
                        </Paper>
                    </Stack>
                </Grid>

                {/* COLUNA DA DIREITA COM FILTROS NOVOS */}
                <Grid item xs={12} md={4} lg={3}>
                    <Paper
                        elevation={3}
                        sx={{
                            borderRadius: 1,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            maxHeight: 'calc(100vh - 100px)', 
                            overflow: 'hidden'
                        }}
                    >
                        <Box sx={{ p: 1, bgcolor: '#fff', borderBottom: '1px solid #eee' }}>
                            <Stack spacing={1}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    Classificação de erros por tag
                                </Typography>
                                
                                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                    <Select
                                        value={tagGroup}
                                        onChange={(e) => setTagGroup(e.target.value)}
                                        size="small"
                                        sx={{ height: 25, fontSize: '0.7rem', flexGrow: 1 }}
                                    >
                                        <MenuItem value="todos" sx={{ fontSize: '0.7rem' }}>Todos Grupos</MenuItem>
                                        {companies.map(c => (
                                            <MenuItem key={c.id} value={c.name} sx={{ fontSize: '0.7rem' }}>{c.name}</MenuItem>
                                        ))}
                                    </Select>

                                    <ToggleButtonGroup
                                        value={tagRange}
                                        exclusive
                                        onChange={(e, val) => val && setTagRange(val)}
                                        size="small"
                                        sx={{ height: 25 }}
                                    >
                                        {[7, 15, 20, 45, 90].map(d => (
                                            <ToggleButton key={d} value={d} sx={{ fontSize: '0.6rem', px: 1 }}>
                                                {d}d
                                            </ToggleButton>
                                        ))}
                                    </ToggleButtonGroup>
                                </Stack>
                            </Stack>
                        </Box>
                        <Box sx={{ 
                            flexGrow: 1, 
                            overflowY: 'auto',
                            scrollbarWidth: 'none',
                            '&::-webkit-scrollbar': { display: 'none' }
                        }}>
                            <TicketClassificationList range={tagRange} group={tagGroup} />
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <CreateAlertModal
                open={openAlertModal}
                onClose={() => setOpenAlertModal(false)}
                onSave={handleAddAlert}
            />
        </Box>
    )
}