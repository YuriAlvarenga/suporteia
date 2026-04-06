import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Box, Typography, Stack, LinearProgress } from '@mui/material'

export default function TicketClassificationList({ range, group }) {
    const { tickets } = useSelector((state) => state.tickets)

    const { dataTags, maxTags, totalTicketsPeriodo } = useMemo(() => {
        if (!tickets) return { dataTags: [], maxTags: 0, totalTicketsPeriodo: 0 }

        const agora = new Date()
        const limiteData = new Date()
        limiteData.setDate(agora.getDate() - range)

        const porTag = {}
        let totalCount = 0

        tickets.forEach(t => {
            const dataTicket = new Date(t.created_at)
            
            // Filtro de Tempo
            const dentroDoTempo = dataTicket >= limiteData
            
            // Filtro de Grupo
            const empresaRaw = t.cliente || ''
            const nomeEmpresa = empresaRaw.includes(' - ') ? empresaRaw.split(' - ')[0] : empresaRaw
            const correspondeGrupo = group === 'todos' || nomeEmpresa.toLowerCase() === group.toLowerCase()

            if (t.classificacao && dentroDoTempo && correspondeGrupo) {
                const nomeTag = t.classificacao.toUpperCase()
                porTag[nomeTag] = (porTag[nomeTag] || 0) + 1
                totalCount++
            }
        })

        const sortedTags = Object.keys(porTag)
            .map(name => ({ 
                name, 
                total: porTag[name],
                // Porcentagem em relação ao total do período/filtro
                percent: totalCount > 0 ? ((porTag[name] / totalCount) * 100).toFixed(1) : 0
            }))
            .sort((a, b) => b.total - a.total)

        const max = sortedTags.length > 0 ? Math.max(...sortedTags.map(o => o.total)) : 0
        
        return { dataTags: sortedTags, maxTags: max, totalTicketsPeriodo: totalCount }
    }, [tickets, range, group])

    return (
        <Box sx={{ p: 1, flexGrow: 1, bgcolor: '#fff' }}>
            <Stack spacing={2.5}>
                {dataTags.length > 0 ? dataTags.map((tag) => (
                    <Box key={tag.name}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#444', textTransform: 'uppercase' }}>
                                    {tag.name}
                                </Typography>
                                {/* Exibição da Porcentagem */}
                                <Typography sx={{ fontSize: '0.6rem', color: 'gray' }}>
                                    {tag.percent}% do total
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--color-highlight)' }}>
                                {tag.total}
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={maxTags > 0 ? (tag.total / maxTags) * 100 : 0}
                            sx={{
                                height: 8, borderRadius: 5, bgcolor: '#eee',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: 'var(--color-highlight)',
                                    borderRadius: 5
                                }
                            }}
                        />
                    </Box>
                )) : (
                    <Typography sx={{ p: 2, textAlign: 'center', fontSize: '0.8rem', color: 'gray' }}>
                        Nenhum ticket encontrado
                    </Typography>
                )}
            </Stack>
        </Box>
    )
}