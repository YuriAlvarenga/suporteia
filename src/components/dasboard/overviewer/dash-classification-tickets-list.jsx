import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Box, Typography, Stack, LinearProgress } from '@mui/material'

export default function TicketClassificationList() {
    const { tickets } = useSelector((state) => state.tickets)

    const { dataTags, maxTags } = useMemo(() => {
        const porTag = {}
        tickets.forEach(t => {
            if (t.classificacao) {
                const nomeTag = t.classificacao.toUpperCase()
                porTag[nomeTag] = (porTag[nomeTag] || 0) + 1
            }
        })

        const sortedTags = Object.keys(porTag)
            .map(name => ({ name, total: porTag[name] }))
            .sort((a, b) => b.total - a.total)

        const max = sortedTags.length > 0 ? Math.max(...sortedTags.map(o => o.total)) : 0
        
        return { dataTags: sortedTags, maxTags: max }
    }, [tickets])

    return (
        <Box sx={{ p: 1, flexGrow: 1, bgcolor: '#fff', overflowY: 'auto' }}>
            <Stack spacing={2.5}>
                {dataTags.map((tag) => (
                    <Box key={tag.name}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#444', textTransform: 'uppercase' }}>
                                {tag.name}
                            </Typography>
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
                ))}
            </Stack>
        </Box>
    )
}