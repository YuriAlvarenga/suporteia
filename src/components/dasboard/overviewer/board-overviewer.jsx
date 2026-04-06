//import React from 'react'
import { useState } from 'react'
import { Box, Grid, Typography, Stack, Paper, Tooltip, IconButton } from '@mui/material'
import TicketTemperatureCards from './dash-temperature-cards'
import TicketClassificationList from './dash-classification-tickets-list'
import RepeatOffenderTickets from './repeat-offenders-tickets'
import FilterListIcon from '@mui/icons-material/FilterList'
import FilterListOffIcon from '@mui/icons-material/FilterListOff'
import AddAlertIcon from '@mui/icons-material/AddAlert'
import CreateAlertModal from './create-alert-modal'


export default function DashboardTickets() {

    // Estado para controlar se os filtros e modal estão abertos
    const [openFilters, setOpenFilters] = useState(false)
    const [openAlertModal, setOpenAlertModal] = useState(false)
    const [showAlertPanel, setShowAlertPanel] = useState(false)

    // Este estado armazenará os alertas criados pelo modal
    const [monitoredStores, setMonitoredStores] = useState([])

    // Função que o Modal chamará para salvar o novo alerta
    const handleAddAlert = (newAlert) => {
        // newAlert deve vir no formato: { group: 'Spoleto', name: 'Vale Sul', tag: 'Todas' }
        setMonitoredStores((prev) => [...prev, newAlert])
        setShowAlertPanel(true) // Abre o painel automaticamente ao criar
    }

    // Função para remover alerta 
    const handleDeleteAlert = (index) => {
        setMonitoredStores((prev) => prev.filter((_, i) => i !== index))
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

                {/* COLUNA DA ESQUERDA (Temperatura + Reincidentes) */}
                <Grid item xs={12} md={8} lg={9}>
                    <Stack spacing={2}>
                        {/* 1. Temperatura (agora dentro da coluna da esquerda) */}
                        <Paper elevation={3} sx={{ borderRadius: 1, overflow: 'hidden' }}>
                            <Box sx={{ p: 1, bgcolor: '#fff', borderBottom: '1px solid #eee' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    Temperatura
                                </Typography>
                            </Box>
                            <TicketTemperatureCards />
                        </Paper>

                        {/* 2. Casos Reincidentes */}
                        <Paper elevation={3} sx={{ borderRadius: 1, overflow: 'hidden', minHeight: '450px' }}>
                            <Box sx={{ p: 1, bgcolor: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                    Casos Reincidentes
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Tooltip title="Criar Alerta de Loja">
                                        <IconButton size="small" onClick={() => setShowAlertPanel(!showAlertPanel)} sx={{ color: '#1976d2' }}>
                                            <AddAlertIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={openFilters ? "Fechar Filtros" : "Abrir Filtros"}>
                                        <IconButton size="small" onClick={() => setOpenFilters(!openFilters)} sx={{ color: '#1976d2' }}>
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

                {/* COLUNA DA DIREITA (Classificação de Erros) */}
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
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                                Classificação de erros por tag
                            </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            <TicketClassificationList />
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