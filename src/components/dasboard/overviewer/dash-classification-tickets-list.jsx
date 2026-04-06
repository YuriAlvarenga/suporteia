import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Box, Typography, Stack, LinearProgress } from '@mui/material'

export default function TicketClassificationList({ range, group }) {
    const { tickets } = useSelector((state) => state.tickets)

    const dataTags = useMemo(() => {
        if (!tickets) return []

        const agora = new Date()
        const limiteData = new Date()
        limiteData.setDate(agora.getDate() - range)

        // 1. Criamos um mapa para armazenar o TOTAL GLOBAL de cada tag e o TOTAL DA LOJA selecionada
        const contagemGlobal = {} // { 'ERRO PAGAMENTO': 8, ... }
        const contagemLoja = {}   // { 'ERRO PAGAMENTO': 3, ... }

        tickets.forEach(t => {
            const dataTicket = new Date(t.created_at)
            if (dataTicket < limiteData || !t.classificacao) return

            const nomeTag = t.classificacao.toUpperCase()
            
            // Incrementa sempre no Global (todas as lojas do período)
            contagemGlobal[nomeTag] = (contagemGlobal[nomeTag] || 0) + 1

            // Se o ticket for da loja selecionada, incrementa no mapa da loja
            const empresaRaw = t.cliente || ''
            const nomeEmpresa = empresaRaw.includes(' - ') ? empresaRaw.split(' - ')[0] : empresaRaw
            
            if (group !== 'todos' && nomeEmpresa.toLowerCase() === group.toLowerCase()) {
                contagemLoja[nomeTag] = (contagemLoja[nomeTag] || 0) + 1
            }
        })

        // 2. Formatamos os dados para exibição
        // Se estiver em "todos", usamos a contagem global. Se não, usamos a da loja.
        const fonteDeDados = group === 'todos' ? contagemGlobal : contagemLoja

        return Object.keys(fonteDeDados)
            .map(name => {
                const totalNaLoja = fonteDeDados[name]
                const totalGeralDaTag = contagemGlobal[name]
                
                // Regra pedida: Porcentagem do grupo em relação ao total daquela tag
                const calculoPercent = group === 'todos' 
                    ? 100 
                    : (totalGeralDaTag > 0 ? (totalNaLoja / totalGeralDaTag) * 100 : 0)

                return { 
                    name, 
                    total: totalNaLoja,
                    totalGeralTag: totalGeralDaTag, // Guardamos para referência se precisar
                    percentExibicao: calculoPercent.toFixed(1),
                    barraValue: calculoPercent
                }
            })
            .sort((a, b) => b.total - a.total)
        
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
                                <Typography sx={{ fontSize: '0.6rem', color: 'gray' }}>
                                    {group === 'todos' 
                                        ? '100% da tag' 
                                        : `${tag.percentExibicao}% do total de ${tag.totalGeralTag} ocorrências`
                                    }
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.75rem', fontWeight: '900', color: 'var(--color-highlight)' }}>
                                {tag.total}
                            </Typography>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={tag.barraValue}
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