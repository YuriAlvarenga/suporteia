import React, { useState } from 'react'
import { Box, Typography, Stack, Paper } from '@mui/material'
import { useSelector } from 'react-redux'
import TicketTemperatureCards from './dash-temperature-cards'
import CreateAlertModal from '../repeat-offender-tickets.jsx/create-alert-modal'
import TicketMetricsCards from './board-of-metrics/board-general-metrics-cards'

export default function DashboardTickets() {


    return (
        <Box sx={{ p: 2, minHeight: '100vh' }}>
            <Stack spacing={3}>

                {/* Seção de Temperatura */}
                <Box>
                    <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' , display:'table', minWidth:'fit-content'}}>
                        <Box sx={{ p: 1, bgcolor: '#fff', borderBottom: '1px solid #eee' }}>
                            <Typography  sx={{fontSize: '0.9rem', fontWeight: 'bold', color: '#333' }}>
                                Temperatura da Operação
                            </Typography>
                        </Box>
                        <TicketTemperatureCards />
                    </Paper>
                </Box>

                {/* Seção de Métricas */}
                <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ p: 1, bgcolor: '#fff', borderBottom: '1px solid #eee' }}>
                        <Typography sx={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333' }}>
                            Métricas de Atendimentos
                        </Typography>
                    </Box>
                    <TicketMetricsCards />
                </Paper>

            </Stack>

        </Box>
    )
}