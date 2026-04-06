import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Grid, Card, CardContent, Typography, Stack, Box } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

export default function TicketTemperatureCards() {
    const { tickets } = useSelector((state) => state.tickets)

    const dataEmpresas = useMemo(() => {
        if (!tickets) return []

        const ticketsAtivos = tickets.filter(t => 
            t.status?.toLowerCase().trim() === "em atendimento"
        )

        const porEmpresa = {}
        ticketsAtivos.forEach(t => {
            const empresaRaw = t.cliente || 'Outros'
            const empresa = empresaRaw.includes(' - ') ? empresaRaw.split(' - ')[0] : empresaRaw
            porEmpresa[empresa] = (porEmpresa[empresa] || 0) + 1
        })

        return Object.keys(porEmpresa)
            .map(name => ({ name, total: porEmpresa[name] }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)
    }, [tickets])

    return (
        <Box sx={{ p: 1, bgcolor: '#fff', width: '100%' }}>
            <Grid 
                container 
                spacing={1.5} 
                // Distribui os itens ocupando toda a largura do container
                justifyContent="space-between" 
                sx={{ pb: 1 }}
            >
                {dataEmpresas.map((emp) => {
                    const isCritical = emp.total > 5
                    const statusColor = isCritical ? '#ff1744' : '#00e676'
                    
                    return (
                        <Grid 
                            item 
                            key={emp.name} 
                            // xs={true} faz com que cada item cresça igualmente para ocupar o espaço
                            xs={true} 
                            sx={{ minWidth: '130px', maxWidth: '20%' }}
                        >
                            <Card sx={{
                                borderRadius: 1, 
                                boxShadow: 'none', 
                                border: '1px solid #ccc',
                                borderLeft: `6px solid ${statusColor}`,
                                animation: isCritical ? 'borderBlink 2s infinite ease-in-out' : 'none',
                                height: '110px', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'center'
                            }}>
                                <CardContent sx={{ p: '10px !important', textAlign: 'center' }}>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            fontWeight: 'bold', 
                                            color: '#333', 
                                            fontSize: '0.7rem', 
                                            display: '-webkit-box', 
                                            WebkitLineClamp: 2, 
                                            WebkitBoxOrient: 'vertical', 
                                            overflow: 'hidden', 
                                            height: '2.2em', 
                                            lineHeight: 1.1 
                                        }}
                                    >
                                        {emp.name.toUpperCase()}
                                    </Typography>
                                    
                                    <Stack alignItems="center">
                                        <Typography variant="h5" sx={{ fontWeight: '900', color: 'var(--color-highlight)', fontSize: '1.4rem' }}>
                                            {emp.total}
                                        </Typography>
                                        
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            <TrendingUpIcon sx={{ fontSize: '0.8rem', color: statusColor }} />
                                            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', fontWeight: 'bold'}}>
                                                Chamados Abertos
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    )
                })}
            </Grid>
        </Box>
    )
}