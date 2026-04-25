import React, { useMemo, useState, useEffect } from 'react'
import { Box, Paper, Stack, Typography, MenuItem, Select, ToggleButtonGroup, ToggleButton, Divider } from '@mui/material'
import { useSelector } from 'react-redux'
import AssignmentIcon from '@mui/icons-material/Assignment'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import AssessmentIcon from '@mui/icons-material/Assessment'
import { subDays, isAfter, parseISO, format } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, Label } from 'recharts'
import BoardRankingsSection from './board-rankings-section'
import BoardTagsSection from './board-tag-section'

export default function TicketMetricsCards() {
    const { tickets = [] } = useSelector((state) => state.tickets)
    const { companies = [] } = useSelector((state) => state.companies)

    const [range, setRange] = useState(7)
    const [group, setGroup] = useState('todos') 
    const [storeFilter, setStoreFilter] = useState('todos') 
    const [userFilter, setUserFilter] = useState('todos')
    const [selectedMetric, setSelectedMetric] = useState('total')

    useEffect(() => {
        setStoreFilter('todos')
    }, [group])

    const availableStores = useMemo(() => {
        if (group === 'todos') return []
        const companyTickets = tickets.filter(t => t.company_id === group)
        const storesMap = new Map()
        companyTickets.forEach(t => {
            if (t.cnpj && !storesMap.has(t.cnpj)) {
                storesMap.set(t.cnpj, {
                    name: t.cliente,
                    cnpj: t.cnpj
                })
            }
        })
        return Array.from(storesMap.values()).sort((a, b) => a.name.localeCompare(b.name))
    }, [tickets, group])

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
            const matchGroup = group === 'todos' || t.company_id === group
            const matchStore = storeFilter === 'todos' || t.cnpj === storeFilter
            const matchUser = userFilter === 'todos' || t.responsavel === userFilter
            return matchGroup && matchStore && matchUser
        })

        // --- RANKING DE GRUPOS (DINÂMICO POR MÉTRICA) ---
        const groupRanking = companies.map(c => {
            const count = periodTickets.filter(t => {
                const isIndevido = t.indevido === true || t.is_invalid === true
                const matchMetric = selectedMetric === 'indevido' ? isIndevido : true
                return t.company_id === c.id && matchMetric
            }).length

            return {
                name: c.name.toUpperCase(),
                id: c.id,
                count,
                percent: periodTickets.length > 0 ? ((count / periodTickets.length) * 100).toFixed(1) : 0
            }
        })
        .filter(item => {
            const isNotCurrentGroup = group === 'todos' || item.id !== group
            return isNotCurrentGroup && item.count > 0 
        })
        .sort((a, b) => b.count - a.count).slice(0, 5)

        // --- RANKING DE USUÁRIOS (DINÂMICO POR MÉTRICA) ---
        const allSystemUsers = [...new Set(tickets.map(t => t.responsavel))].filter(Boolean)
        const userRanking = allSystemUsers.map(u => {
            const count = periodTickets.filter(t => {
                const isIndevido = t.indevido === true || t.is_invalid === true
                const matchMetric = selectedMetric === 'indevido' ? isIndevido : true
                const matchGroup = group === 'todos' || t.company_id === group
                const matchStore = storeFilter === 'todos' || t.cnpj === storeFilter
                return t.responsavel === u && matchMetric && matchGroup && matchStore
            }).length

            return {
                name: u,
                count,
                percent: filtered.length > 0 ? ((count / filtered.length) * 100).toFixed(1) : 0
            }
        })
        .filter(item => (userFilter === 'todos' || item.name !== userFilter) && item.count > 0)
        .sort((a, b) => b.count - a.count)

        const totalFiltered = filtered.length
        const totalPeriod = periodTickets.length
        const indevidosCount = filtered.filter(t => t.indevido === true || t.is_invalid === true).length
        const mediaValue = range > 0 ? (totalFiltered / range).toFixed(1) : totalFiltered
        const percentOfPeriod = totalPeriod > 0 ? ((totalFiltered / totalPeriod) * 100).toFixed(1) : 0
        const errorRate = totalFiltered > 0 ? ((indevidosCount / totalFiltered) * 100).toFixed(1) : 0

        const dailyData = {}
        const chartRange = range === 1 ? 0 : range - 1;
        for (let i = chartRange; i >= 0; i--) {
            const dateKey = format(subDays(new Date(), i), 'dd/MM')
            dailyData[dateKey] = { total: 0, indevido: 0 }
        }
        filtered.forEach(t => {
            const dateKey = format(parseISO(t.data_abertura), 'dd/MM')
            if (dailyData[dateKey]) {
                dailyData[dateKey].total += 1
                if (t.indevido || t.is_invalid) dailyData[dateKey].indevido += 1
            }
        })
        const chartData = Object.keys(dailyData).map(key => ({
            name: key,
            value: selectedMetric === 'indevido' ? dailyData[key].indevido : dailyData[key].total
        }))
        const mediaGrafico = range > 0 ? (chartData.reduce((acc, curr) => acc + curr.value, 0) / range) : 0

        const globalTags = {}
        const filteredTags = {}
        const ticketsPorTag = {}
        periodTickets.forEach(t => {
            if (!t.classificacao) return
            const tagName = t.classificacao.toUpperCase()
            globalTags[tagName] = (globalTags[tagName] || 0) + 1
            const matchGroup = group === 'todos' || t.company_id === group
            const matchStore = storeFilter === 'todos' || t.cnpj === storeFilter
            const matchUser = userFilter === 'todos' || t.responsavel === userFilter
            const matchMetric = selectedMetric === 'indevido' ? (t.indevido || t.is_invalid) : true
            if (matchGroup && matchStore && matchUser && matchMetric) {
                filteredTags[tagName] = (filteredTags[tagName] || 0) + 1
                if (!ticketsPorTag[tagName]) ticketsPorTag[tagName] = []
                ticketsPorTag[tagName].push(t)
            }
        })
        const classificationData = Object.keys(filteredTags).map(name => ({
            name,
            count: filteredTags[name],
            globalCount: globalTags[name],
            percent: globalTags[name] > 0 ? (filteredTags[name] / globalTags[name]) * 100 : 0,
            listaTickets: (ticketsPorTag[name] || []).sort((a, b) => new Date(b.data_abertura) - new Date(a.data_abertura))
        })).sort((a, b) => b.count - a.count)

        return { totalFiltered, indevidosCount, mediaValue, chartData, percentOfPeriod, errorRate, classificationData, mediaGrafico, groupRanking, userRanking }
    }, [tickets, companies, range, group, storeFilter, userFilter, selectedMetric])

    const MetricCard = ({ type, title, value, subtitle, icon, color }) => (
        <Paper
            elevation={selectedMetric === type ? 4 : 1}
            onClick={() => setSelectedMetric(type)}
            sx={{
                p: 1.5, flex: 1, borderLeft: `4px solid ${color}`, borderRadius: 1, cursor: 'pointer', transition: '0.3s',
                bgcolor: selectedMetric === type ? `${color}05` : 'white',
                transform: selectedMetric === type ? 'scale(1.02)' : 'scale(1)',
                border: selectedMetric === type ? `1px solid ${color}44` : '1px solid transparent',
            }}
        >
            <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ bgcolor: `${color}11`, p: 1, borderRadius: 1, display: 'flex' }}>
                    {React.cloneElement(icon, { sx: { color: color, fontSize: 20 } })}
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>{title}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.1 }}>{value}</Typography>
                    {subtitle && <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', display: 'block' }}>{subtitle}</Typography>}
                </Box>
            </Stack>
        </Paper>
    )

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ p: 1, bgcolor: '#fcfcfc', borderBottom: '1px solid #eee' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="flex-end">
                    
                    <Select value={group} onChange={(e) => setGroup(e.target.value)} size="small" 
                        sx={{ height: 25, fontSize: '0.7rem', minWidth: 130, bgcolor: 'white', 
                        color: group !== 'todos' ? 'var(--color-highlight)' : 'inherit',
                        '& .MuiSelect-select': { fontWeight: group !== 'todos' ? 'bold' : 'normal' } }}>
                        <MenuItem value="todos" sx={{ fontSize: '0.7rem' }}>Todos Grupos</MenuItem>
                        {companies.map(c => (<MenuItem key={c.id} value={c.id} sx={{ fontSize: '0.7rem' }}>{c.name}</MenuItem>))}
                    </Select>

                    <Select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} size="small" 
                        sx={{ height: 25, fontSize: '0.7rem', minWidth: 150, bgcolor: 'white',
                        color: storeFilter !== 'todos' ? 'var(--color-highlight)' : 'inherit',
                        '& .MuiSelect-select': { fontWeight: storeFilter !== 'todos' ? 'bold' : 'normal' } }}
                        disabled={group === 'todos'}>
                        <MenuItem value="todos" sx={{ fontSize: '0.7rem' }}>{group === 'todos' ? 'Selecione um Grupo' : 'Todas Lojas'}</MenuItem>
                        {availableStores.map(s => (<MenuItem key={s.cnpj} value={s.cnpj} sx={{ fontSize: '0.7rem' }}>{s.name}</MenuItem>))}
                    </Select>

                    <Select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} size="small" 
                        sx={{ height: 25, fontSize: '0.7rem', minWidth: 130, bgcolor: 'white',
                        color: userFilter !== 'todos' ? 'var(--color-highlight)' : 'inherit',
                        '& .MuiSelect-select': { fontWeight: userFilter !== 'todos' ? 'bold' : 'normal' } }}>
                        <MenuItem value="todos" sx={{ fontSize: '0.7rem' }}>Todos Usuários</MenuItem>
                        {[...new Set(tickets.map(t => t.responsavel))].filter(Boolean).map(res => (<MenuItem key={res} value={res} sx={{ fontSize: '0.7rem' }}>{res}</MenuItem>))}
                    </Select>

                    <ToggleButtonGroup 
                        value={range} 
                        exclusive 
                        onChange={(e, val) => val !== null && setRange(val)} 
                        size="small" 
                        sx={{ 
                            height: 25, 
                            bgcolor: 'white',
                            '& .MuiToggleButton-root': {
                                fontSize: '0.65rem',
                                px: 1,
                                textTransform: 'capitalize',
                                border: '1px solid #eee',
                                '&.Mui-selected': {
                                    backgroundColor: 'var(--color-highlight)',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: 'var(--color-highlight)',
                                        opacity: 0.9
                                    }
                                }
                            }
                        }} 
                    >
                        <ToggleButton value={1}>Hoje</ToggleButton>
                        <ToggleButton value={7}>7 Dias</ToggleButton>
                        <ToggleButton value={15}>15 Dias</ToggleButton>
                        <ToggleButton value={30}>30 Dias</ToggleButton>
                        <ToggleButton value={60}>60 Dias</ToggleButton>
                    </ToggleButtonGroup>
                </Stack>
            </Box>

            <Box sx={{ p: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <MetricCard type="total" title="Total de Chamados" value={metricsData.totalFiltered} subtitle={`${metricsData.percentOfPeriod}% do total no período`} icon={<AssignmentIcon />} color="#0288d1" />
                    <MetricCard type="indevido" title="Chamados Indevidos" value={metricsData.indevidosCount} subtitle={`${metricsData.errorRate}% do total filtrado`} icon={<ErrorOutlineIcon />} color="#0288d1" />
                    <MetricCard type="media" title="Média Por Período" value={metricsData.mediaValue} icon={<AssessmentIcon />} color="#0288d1" />
                </Stack>
            </Box>

            <Divider sx={{ mx: 2 }} />
            <BoardRankingsSection groupRanking={metricsData.groupRanking} userRanking={metricsData.userRanking} />
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
                            {selectedMetric === 'media' && (
                                <ReferenceLine y={metricsData.mediaGrafico} stroke="#0288d1" strokeDasharray="3 3" strokeWidth={2}>
                                    <Label value={`Média: ${metricsData.mediaValue}`} position="right" fill="#0288d1" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                                </ReferenceLine>
                            )}
                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                                {metricsData.chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={'var(--color-highlight)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </Box>

            <Divider sx={{ mx: 2, mb: 2 }} />

            <BoardTagsSection 
                classificationData={metricsData.classificationData} 
                isFiltered={group !== 'todos' || storeFilter !== 'todos' || userFilter !== 'todos' || selectedMetric === 'indevido'}
                selectedMetric={selectedMetric}
            />
        </Box>
    )
}