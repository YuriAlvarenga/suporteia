import React, { useState } from 'react'
import { Box, Grid, Typography, Stack, Paper, Tooltip, IconButton, ToggleButtonGroup, ToggleButton, MenuItem, Select, FormControl } from '@mui/material'
import { useSelector } from 'react-redux'
import TicketTemperatureCards from './dash-temperature-cards'
import RepeatOffenderTickets from './repeat-offenders-tickets'
import FilterListIcon from '@mui/icons-material/FilterList'
import FilterListOffIcon from '@mui/icons-material/FilterListOff'
import AddAlertIcon from '@mui/icons-material/AddAlert'
import CreateAlertModal from './create-alert-modal'
import TicketMetricsCards from './board-of-metrics/board-general-metrics-cards'

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
       <Box sx={{ p: 1, display: 'flex', justifyContent: 'center', minHeight: '100vh'}}>
            <Grid container spacing={2}>
                    <Stack spacing={2}>
                        <Paper elevation={3} sx={{ borderRadius: 1, overflow: 'hidden' }}>
                            <Box sx={{ p: 1, bgcolor: '#fff', borderBottom: '1px solid #eee' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    Temperatura
                                </Typography>
                            </Box>
                            <TicketTemperatureCards />
                        </Paper>

                        <Paper elevation={3} sx={{ borderRadius: 1, overflow: 'hidden' }}>
                            <Box sx={{ p: 1, bgcolor: '#fff', borderBottom: '1px solid #eee' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    Métricas de Atendimentos
                                </Typography>
                            </Box>
                            <TicketMetricsCards />
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
            <CreateAlertModal
                open={openAlertModal}
                onClose={() => setOpenAlertModal(false)}
                onSave={handleAddAlert}
            />
        </Box>
    )
}