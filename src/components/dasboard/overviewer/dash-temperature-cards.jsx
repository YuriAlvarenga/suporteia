import React, { useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCompanies } from '../../../redux/slice/companies/company-slice'
import { Grid, Card, CardContent, Typography, Stack, Box } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

export default function TicketTemperatureCards() {
    const dispatch = useDispatch()

    // Pegando dados dos dois slices
    const { companies } = useSelector((state) => state.companies)
    const { tickets } = useSelector((state) => state.tickets)

    // Garante que as empresas estejam carregadas
    useEffect(() => {
        if (companies.length === 0) {
            dispatch(fetchCompanies())
        }
    }, [dispatch, companies.length])

    const dataEmpresas = useMemo(() => {
        if (!tickets || !companies) return []

        // 1. Filtra apenas tickets "em atendimento"
        const ticketsAtivos = tickets.filter(t =>
            t.status?.toLowerCase().trim() === "em atendimento"
        )

        // 2. Cria um mapa de contagem: { "uuid-da-empresa": quantidade }
        const contagemPorId = {}
        ticketsAtivos.forEach(t => {
            if (t.company_id) {
                contagemPorId[t.company_id] = (contagemPorId[t.company_id] || 0) + 1
            }
        })

        // 3. Mapeia a lista de empresas real para o formato do card
        return companies
            .map(emp => ({
                name: emp.name,
                total: contagemPorId[emp.id] || 0
            }))
            .filter(item => item.total > 0) // Só mostra quem tem problema ativo
            .sort((a, b) => b.total - a.total) // Os mais críticos primeiro
            .slice(0, 5) // Top 5
    }, [tickets, companies])

    return (
        <Box sx={{ p: 1, bgcolor: '#fff', width: '100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Grid container spacing={1.5} justifyContent="flex-start" sx={{ pb: 1 }}>
                {dataEmpresas.map((emp) => {
                    const isCritical = emp.total > 5
                    const statusColor = isCritical ? '#ff1744' : '#00e676'

                    return (
                        <Grid item key={emp.name} xs={12} sm={6} md={2.4} sx={{ minWidth: '130px' }}>
                            <Card sx={{
                                borderRadius: 1.5,
                                boxShadow: 'none',
                                border: '1px solid #eee',
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
                                            color: '#666',
                                            fontSize: '0.7rem',
                                            textTransform: 'uppercase',
                                            display: 'block',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}
                                    >
                                        {emp.name}
                                    </Typography>

                                    <Stack alignItems="center">
                                        <Typography variant="h5" sx={{ fontWeight: '900', color: '#333', fontSize: '1.4rem' }}>
                                            {emp.total}
                                        </Typography>

                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            <TrendingUpIcon sx={{ fontSize: '0.8rem', color: statusColor }} />
                                            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary', fontWeight: 'bold' }}>
                                                Chamados
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    )
                })}
            </Grid>

            <style>
                {`
                @keyframes borderBlink {
                    0% { border-left-color: #ff1744; }
                    50% { border-left-color: #ffcdd2; }
                    100% { border-left-color: #ff1744; }
                }
                `}
            </style>
        </Box>
    )
}