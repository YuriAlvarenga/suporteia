import React, { useMemo, useState } from 'react'
import { Box, Paper, Stack, Typography, MenuItem, Select, ToggleButtonGroup, ToggleButton, Divider, LinearProgress } from '@mui/material'
import { useSelector } from 'react-redux'
import AssignmentIcon from '@mui/icons-material/Assignment'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import AssessmentIcon from '@mui/icons-material/Assessment'
import { subDays, isAfter, parseISO, format } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts'

export default function TicketMetricsCards() {
    const { tickets = [] } = useSelector((state) => state.tickets)
    const { companies = [] } = useSelector((state) => state.companies)

    const [range, setRange] = useState(7)
    const [group, setGroup] = useState('todos')
    const [userFilter, setUserFilter] = useState('todos')
    const [selectedMetric, setSelectedMetric] = useState('total')

    const metricsData = useMemo(() => {
        const dateLimit = subDays(new Date(), range)

        const periodTickets = tickets.filter(t => {
            if (!t.data_abertura) return false
            try {
                const ticketDate = parseISO(t.data_abertura)
                return isAfter(ticketDate, dateLimit)
            } catch (err) { return false }
        })

        const filtered = periodTickets.filter(t => {
            const matchGroup = group === 'todos' || (t.cliente && t.cliente.toLowerCase().includes(group.toLowerCase()))
            const matchUser = userFilter === 'todos' || t.responsavel === userFilter
            return matchGroup && matchUser
        })

        const totalFiltered = filtered.length
        const totalPeriod = periodTickets.length
        const indevidosCount = filtered.filter(t => t.indevido === true).length
        const mediaValue = range > 0 ? (totalFiltered / range).toFixed(1) : 0

        const percentOfPeriod = totalPeriod > 0 ? ((totalFiltered / totalPeriod) * 100).toFixed(1) : 0
        const errorRate = totalFiltered > 0 ? ((indevidosCount / totalFiltered) * 100).toFixed(1) : 0

        const dailyData = {}
        for (let i = range - 1; i >= 0; i--) {
            const dateKey = format(subDays(new Date(), i), 'dd/MM')
            dailyData[dateKey] = { total: 0, indevido: 0 }
        }

        filtered.forEach(t => {
            const dateKey = format(parseISO(t.data_abertura), 'dd/MM')
            if (dailyData[dateKey]) {
                dailyData[dateKey].total += 1
                if (t.indevido) dailyData[dateKey].indevido += 1
            }
        })

        const chartData = Object.keys(dailyData).map(key => ({
            name: key,
            value: selectedMetric === 'indevido' ? dailyData[key].indevido : dailyData[key].total
        }))

        // Cálculo da média para a linha (baseada no valor total exibido no gráfico no momento)
        const totalExibido = chartData.reduce((acc, curr) => acc + curr.value, 0)
        const mediaGrafico = range > 0 ? (totalExibido / range) : 0

        const globalTags = {}
        const filteredTags = {}

        periodTickets.forEach(t => {
            if (!t.classificacao) return
            const tagName = t.classificacao.toUpperCase()
            globalTags[tagName] = (globalTags[tagName] || 0) + 1

            const matchGroup = group === 'todos' || (t.cliente && t.cliente.toLowerCase().includes(group.toLowerCase()))
            const matchUser = userFilter === 'todos' || t.responsavel === userFilter

            if (matchGroup && matchUser) {
                filteredTags[tagName] = (filteredTags[tagName] || 0) + 1
            }
        })

        const classificationData = Object.keys(filteredTags).map(name => {
            const count = filteredTags[name]
            const globalCount = globalTags[name]
            const percent = globalCount > 0 ? (count / globalCount) * 100 : 0
            return { name, count, globalCount, percent }
        }).sort((a, b) => b.count - a.count)

        return {
            totalFiltered, indevidosCount, mediaValue, chartData,
            percentOfPeriod, errorRate, classificationData, mediaGrafico
        }
    }, [tickets, range, group, userFilter, selectedMetric])

    const MetricCard = ({ type, title, value, subtitle, icon, color }) => {
        const isSelected = selectedMetric === type
        return (
            <Paper
                elevation={isSelected ? 4 : 1}
                onClick={() => setSelectedMetric(type)}
                sx={{
                    p: 1.5, flex: 1, borderLeft: `4px solid ${color}`, borderRadius: 1, cursor: 'pointer', transition: '0.3s',
                    bgcolor: isSelected ? `${color}05` : 'var(--color-white)',
                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                    border: isSelected ? `1px solid ${color}44` : '1px solid transparent'
                }}
            >
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box sx={{ bgcolor: `${color}11`, p: 1, borderRadius: 1, display: 'flex' }}>
                        {React.cloneElement(icon, { sx: { color: color, fontSize: 20 } })}
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>{title}</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.1 }}>{value}</Typography>
                        {subtitle && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', display: 'block', mt: 0.2, opacity: 0.8 }}>
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Stack>
            </Paper>
        )
    }

    return (
        <Paper elevation={3} sx={{ borderRadius: 1, overflow: 'hidden' }}>
            <Box sx={{ p: 1, bgcolor: 'var(--color-white)', borderBottom: '1px solid #eee' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Métricas de Atendimento</Typography>
                    <Stack direction="row" spacing={1}>
                        <Select value={group} onChange={(e) => setGroup(e.target.value)} size="small" sx={{ height: 25, fontSize: '0.7rem', minWidth: 100 }}>
                            <MenuItem value="todos" sx={{ fontSize: '0.7rem' }}>Todos Grupos</MenuItem>
                            {companies.map(c => <MenuItem key={c.id} value={c.name} sx={{ fontSize: '0.7rem' }}>{c.name.toUpperCase()}</MenuItem>)}
                        </Select>
                        <Select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} size="small" sx={{ height: 25, fontSize: '0.7rem', minWidth: 100 }}>
                            <MenuItem value="todos" sx={{ fontSize: '0.7rem' }}>Todos Usuários</MenuItem>
                            {[...new Set(tickets.map(t => t.responsavel))].filter(Boolean).map(res => <MenuItem key={res} value={res} sx={{ fontSize: '0.7rem' }}>{res}</MenuItem>)}
                        </Select>
                        <ToggleButtonGroup value={range} exclusive onChange={(e, val) => val && setRange(val)} size="small" sx={{
                            height: 25,
                            '& .MuiToggleButton-root': {
                                fontSize: '0.65rem', px: 1, py: 0, fontWeight: 'bold', color: 'var(--color-highlight)',
                                '&.Mui-selected': {
                                    backgroundColor: 'var(--color-highlight)', color: 'var(--color-white)',
                                    '&:hover': { backgroundColor: 'var(--color-highlight)', opacity: 0.9 }
                                }
                            }
                        }}>
                            {[7, 15, 20, 45, 90].map(d => <ToggleButton key={d} value={d} sx={{ textTransform: 'none' }}>{d} Dias</ToggleButton>)}
                        </ToggleButtonGroup>
                    </Stack>
                </Stack>
            </Box>

            <Box sx={{ p: 2, bgcolor: '#fcfcfc' }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <MetricCard type="total" title="Total de Chamados" value={metricsData.totalFiltered} subtitle={`${metricsData.percentOfPeriod}% do total no período`} icon={<AssignmentIcon />} color="#0288d1" />
                    <MetricCard type="indevido" title="Chamados Indevidos" value={metricsData.indevidosCount} subtitle={`${metricsData.errorRate}% do total filtrado`} icon={<ErrorOutlineIcon />} color="#0288d1" />
                    <MetricCard type="media" title="Média Diária" value={metricsData.mediaValue} icon={<AssessmentIcon />} color="#0288d1" />
                </Stack>
            </Box>

            <Divider sx={{ mx: 2 }} />

            <Box sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666', mb: 2, display: 'block', textAlign: 'center' }}>
                    Distribuição Diária: {selectedMetric === 'indevido' ? 'Chamados Indevidos' : 'Total de Chamados'}
                </Typography>
                <Box sx={{ height: 180, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metricsData.chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                            <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px' }} />
                            
                            {/* A LINHA SÓ APARECE SE 'MEDIA' ESTIVER SELECIONADO */}
                            {selectedMetric === 'media' && (
                                <ReferenceLine 
                                    y={metricsData.mediaGrafico} 
                                    stroke="#0288d1" 
                                    strokeDasharray="3 3" 
                                    strokeWidth={2}
                                >
                                    <Label 
                                        value={`Média: ${metricsData.mediaValue}`} 
                                        position="right" 
                                        fill="#0288d1" 
                                        style={{ fontSize: '10px', fontWeight: 'bold' }} 
                                    />
                                </ReferenceLine>
                            )}

                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                                {metricsData.chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={selectedMetric === 'indevido' ? '#d32f2f' : 'var(--color-highlight)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Box>

            <Divider sx={{ mx: 2, mb: 2 }} />

            <Box sx={{ p: 2, pt: 0 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666', mb: 2, display: 'block' }}>
                    Classificação por Tag
                </Typography>
                <Stack spacing={2}>
                    {metricsData.classificationData.length > 0 ? metricsData.classificationData.map((tag) => (
                        <Box key={tag.name}>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                <Box>
                                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#444' }}>{tag.name}</Typography>
                                    <Typography sx={{ fontSize: '0.6rem', color: 'gray' }}>
                                        {group === 'todos' && userFilter === 'todos'
                                            ? '100% das ocorrências'
                                            : `${tag.percent.toFixed(1)}% das ${tag.globalCount} ocorrências do período`}
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-highlight)' }}>
                                    {tag.count}
                                </Typography>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={tag.percent}
                                sx={{
                                    height: 6, borderRadius: 5, bgcolor: '#eee',
                                    '& .MuiLinearProgress-bar': { bgcolor: 'var(--color-highlight)', borderRadius: 5 }
                                }}
                            />
                        </Box>
                    )) : (
                        <Typography sx={{ textAlign: 'center', fontSize: '0.75rem', color: 'gray', py: 2 }}>
                            Nenhuma tag classificada no filtro atual
                        </Typography>
                    )}
                </Stack>
            </Box>
        </Paper>
    )
}