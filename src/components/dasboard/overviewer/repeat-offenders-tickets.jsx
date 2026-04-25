import React, { useMemo, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
    Box, Typography, Stack, LinearProgress, Accordion, AccordionSummary,
    AccordionDetails, Chip, FormControl, Select, MenuItem, Grid,
    TextField, Collapse, Button, Divider, Paper, IconButton, ToggleButtonGroup, ToggleButton
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { subDays, isAfter, parseISO } from 'date-fns'

export default function RepeatOffenderTickets({ showFilters, showAlerts, onOpenModal, monitoredStores = [] }) {
    const { tickets = [] } = useSelector((state) => state.tickets)
    const { companies = [] } = useSelector((state) => state.companies)

    const [days, setDays] = useState(7)
    const [selectedGroup, setSelectedGroup] = useState('todos') 
    const [selectedStore, setSelectedStore] = useState('Todas as Lojas') 
    const [selectedTag, setSelectedTag] = useState('TODOS')

    const normalize = (text) => text?.toString().toUpperCase().trim() || "";

    useEffect(() => {
        setSelectedStore('Todas as Lojas')
    }, [selectedGroup])

    const groupedMonitored = useMemo(() => {
        return monitoredStores.reduce((acc, curr) => {
            const groupName = curr.group || 'Geral'
            if (!acc[groupName]) acc[groupName] = []
            acc[groupName].push(curr)
            return acc
        }, {})
    }, [monitoredStores])

    const filterOptions = useMemo(() => {
        const tags = new Set()
        const ticketsForStores = selectedGroup === 'todos' 
            ? tickets 
            : tickets.filter(t => t.company_id === selectedGroup)

        const storesSet = new Set()
        ticketsForStores.forEach(t => {
            if (t.cliente) storesSet.add(t.cliente)
        })

        tickets.forEach(t => {
            if (t.classificacao) tags.add(t.classificacao)
        })

        return {
            groups: companies,
            stores: Array.from(storesSet).sort(),
            tags: Array.from(tags).sort()
        }
    }, [tickets, companies, selectedGroup])

    const reincidentes = useMemo(() => {
        if (!tickets || tickets.length === 0) return {}
        const dataCorte = subDays(new Date(), days)

        const filtrados = tickets.filter(t => {
            if (!t.data_abertura) return false
            const ticketDate = parseISO(t.data_abertura)
            const dentroDoPrazo = isAfter(ticketDate, dataCorte)
            
            const temClassificacao = !!t.classificacao
            const matchGroup = selectedGroup === 'todos' || t.company_id === selectedGroup
            const matchStore = selectedStore === 'Todas as Lojas' || t.cliente === selectedStore
            const matchTag = selectedTag === 'TODOS' || t.classificacao === selectedTag
            
            return dentroDoPrazo && temClassificacao && matchGroup && matchStore && matchTag
        })

        const estrutura = {}
        filtrados.forEach(t => {
            const companyObj = companies.find(c => c.id === t.company_id)
            const grupoNome = companyObj ? companyObj.name.toLowerCase() : 'outros'
            
            const lojaKey = t.cliente?.toLowerCase() || "unidade única"
            const tagKey = t.classificacao
            
            if (!estrutura[grupoNome]) estrutura[grupoNome] = {}
            if (!estrutura[grupoNome][lojaKey]) estrutura[grupoNome][lojaKey] = {}
            if (!estrutura[grupoNome][lojaKey][tagKey]) {
                estrutura[grupoNome][lojaKey][tagKey] = { tickets: [], total: 0 }
            }
            estrutura[grupoNome][lojaKey][tagKey].tickets.push(t)
            estrutura[grupoNome][lojaKey][tagKey].total += 1
        })

        const resultado = {}
        Object.entries(estrutura).forEach(([grupo, lojas]) => {
            Object.entries(lojas).forEach(([loja, tags]) => {
                Object.entries(tags).forEach(([tag, dados]) => {
                    if (dados.total > 2) {
                        if (!resultado[grupo]) resultado[grupo] = []
                        resultado[grupo].push({
                            loja,
                            tag,
                            total: dados.total,
                            tickets: dados.tickets.sort((a, b) => new Date(b.data_abertura) - new Date(a.data_abertura))
                        })
                    }
                })
            })
        })
        return resultado
    }, [tickets, companies, days, selectedGroup, selectedStore, selectedTag])

    const gruposKeys = Object.keys(reincidentes)

    return (
        <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 2 }}>

            {/* PAINEL DE ALERTAS */}
            <Collapse in={showAlerts}>
                <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 4, height: 18, bgcolor: 'var(--color-highlight)', borderRadius: 1 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333' }}>
                                Lojas em monitoramento
                            </Typography>
                        </Box>
                        <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={onOpenModal} sx={{ textTransform: 'none', borderColor: 'var(--color-highlight)', color: 'var(--color-highlight)' }} >
                            Novo Alerta
                        </Button>
                    </Stack>

                    <Stack spacing={2}>
                        {monitoredStores.length === 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                Nenhuma loja configurada para monitoramento.
                            </Typography>
                        )}

                        {Object.entries(groupedMonitored).map(([groupName, stores], idx) => (
                            <Box key={idx}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', ml: 0.5, textTransform: 'capitalize', display: 'block', mb: 0.5 }}>
                                    {groupName.toLowerCase()}
                                </Typography>
                                <Stack spacing={1}>
                                    {stores.map((store, sIdx) => {
                                        const grupoData = reincidentes[normalize(groupName)] || []
                                        const infoLoja = grupoData.find(item =>
                                            normalize(item.loja) === normalize(store.name) &&
                                            (normalize(store.tag) === 'TODAS' || normalize(item.tag) === normalize(store.tag))
                                        )
                                        const totalTickets = infoLoja ? infoLoja.total : 0

                                        return (
                                            <Paper key={sIdx} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff' }}>
                                                <Box>
                                                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'capitalize' }}>{store.name.toLowerCase()}</Typography>
                                                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                                                        Tag: <Box component="span" sx={{ color: 'var(--color-highlight)', fontWeight: 'bold' }}>{store.tag}</Box>
                                                    </Typography>
                                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: '500', color: totalTickets > 0 ? 'var(--color-highlight)' : 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                        Status: {totalTickets > 0 ? `${totalTickets} ticket(s) encontrado(s)` : 'Nenhum chamado encontrado'}
                                                    </Typography>
                                                </Box>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    {totalTickets > 0 && (
                                                        <Box sx={{ width: 8, height: 8, bgcolor: '#d32f2f', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                                                    )}
                                                    <IconButton size="small" color="error">
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                </Box>
                <Divider sx={{ mb: 3 }} />
            </Collapse>

            {/* FILTROS */}
            <Collapse in={showFilters}>
                <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ width: 4, height: 18, bgcolor: 'var(--color-highlight)', borderRadius: 1 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333' }}>
                                Filtro de chamados reincidentes
                            </Typography>
                        </Stack>

                        <ToggleButtonGroup
                            value={days} exclusive exclusive onChange={(e, val) => val && setDays(val)}
                            size="small"
                            sx={{
                                height: 25,
                                '& .MuiToggleButton-root': {
                                    fontSize: '0.65rem', px: 1.5, textTransform: 'capitalize', fontWeight: 'bold',
                                    border: '1px solid #eee', bgcolor: 'white',
                                    '&.Mui-selected': { backgroundColor: 'var(--color-highlight)', color: 'white', '&:hover': { backgroundColor: 'var(--color-highlight)', opacity: 0.9 } }
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

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4} md={3}>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedGroup}
                                    onChange={(e) => setSelectedGroup(e.target.value)}
                                    sx={{ fontSize: '0.75rem', height: 32, bgcolor: '#f9f9f9', border: '1px solid #eee', color: selectedGroup !== 'todos' ? 'var(--color-highlight)' : 'inherit', fontWeight: selectedGroup !== 'todos' ? 'bold' : 'normal', textTransform: 'capitalize' }}
                                >
                                    <MenuItem value="todos" sx={{ fontSize: '0.75rem' }}>Todos os Grupos</MenuItem>
                                    {filterOptions.groups.map(g => <MenuItem key={g.id} value={g.id} sx={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{g.name.toLowerCase()}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={4} md={3}>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedStore}
                                    onChange={(e) => setSelectedStore(e.target.value)}
                                    disabled={selectedGroup === 'todos'}
                                    sx={{ fontSize: '0.75rem', height: 32, bgcolor: '#f9f9f9', border: '1px solid #eee', color: selectedStore !== 'Todas as Lojas' ? 'var(--color-highlight)' : 'inherit', fontWeight: selectedStore !== 'Todas as Lojas' ? 'bold' : 'normal', textTransform: 'capitalize' }}
                                >
                                    <MenuItem value="Todas as Lojas" sx={{ fontSize: '0.75rem' }}>Todas as Lojas</MenuItem>
                                    {filterOptions.stores.map(s => <MenuItem key={s} value={s} sx={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{s.toLowerCase()}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={4} md={3}>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedTag}
                                    onChange={(e) => setSelectedTag(e.target.value)}
                                    sx={{ fontSize: '0.75rem', height: 32, bgcolor: '#f9f9f9', border: '1px solid #eee', color: selectedTag !== 'TODOS' ? 'var(--color-highlight)' : 'inherit', fontWeight: selectedTag !== 'TODOS' ? 'bold' : 'normal' }}
                                >
                                    <MenuItem value="TODOS" sx={{ fontSize: '0.75rem' }}>Todas as Tags</MenuItem>
                                    {filterOptions.tags.map(t => <MenuItem key={t} value={t} sx={{ fontSize: '0.75rem' }}>{t}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>
            </Collapse>

            {/* LISTAGEM */}
            {gruposKeys.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed #ccc' }}>
                    <Typography color="text.secondary">Nenhum dado encontrado para os filtros selecionados.</Typography>
                </Box>
            ) : (
                gruposKeys.map((grupo) => (
                    <Box key={grupo} sx={{ mb: 4 }}>
                        <Typography variant="overline" sx={{ display: 'block', mb: 1, borderBottom: '2px solid #eee', textTransform: 'capitalize', fontWeight: '600' }}>
                            Grupo: {grupo}
                        </Typography>
                        <Stack spacing={2}>
                            {reincidentes[grupo].map((item, idx) => (
                                <Box key={idx} sx={{ p: 1.5, border: '1px solid #f0f0f0', borderRadius: 2, '&:hover': { borderColor: '#ccc' } }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                        <Box>
                                            <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 'bold', textTransform: 'capitalize' }}>{item.loja}</Typography>
                                            <Typography sx={{ fontSize: '0.85rem', fontWeight: '800' }}>{item.tag}</Typography>
                                        </Box>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            {monitoredStores.some(m => normalize(m.name).includes(normalize(item.loja)) || normalize(item.loja).includes(normalize(m.name))) && (
                                                <Box sx={{ width: 8, height: 8, bgcolor: 'var(--color-highlight)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                                            )}
                                            <Chip label={`${item.total}`} size="small" sx={{ fontWeight: 900, background:'transparent', color: 'var(--color-highlight)', fontSize: '0.65rem'}}/>
                                        </Stack>
                                    </Stack>
                                    <LinearProgress variant="determinate" value={Math.min((item.total / 5) * 100, 100)} sx={{ height: 4, borderRadius: 2, mb: 1, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: 'var(--color-highlight)' } }} />
                                    <Accordion elevation={0} sx={{ '&:before': { display: 'none' }, bgcolor: '#fafafa' }}>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 32, '& .MuiAccordionSummary-content': { my: 0.5 } }}>
                                            <Typography sx={{ fontSize: '0.65rem', fontWeight: 700 }}>Ver Tickets Relacionados</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails sx={{ p: 1 }}>
                                            {item.tickets.map((t, tIdx) => (
                                                <Typography key={tIdx} sx={{ fontSize: '0.7rem', py: 0.5, borderBottom: '1px solid #eee' }}>
                                                    {new Date(t.data_abertura).toLocaleString('pt-BR')} - ID: {t.id}
                                                </Typography>
                                            ))}
                                        </AccordionDetails>
                                    </Accordion>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                ))
            )}
        </Box>
    )
}