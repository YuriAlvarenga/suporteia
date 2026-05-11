import React, { useMemo, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
    Box, Typography, Stack, LinearProgress, Accordion, AccordionSummary,
    AccordionDetails, Chip, FormControl, Select, MenuItem, Grid,
    Collapse, Button, Divider, Paper, IconButton, ToggleButtonGroup, ToggleButton, Tooltip
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import FilterListIcon from '@mui/icons-material/FilterList'
import FilterListOffIcon from '@mui/icons-material/FilterListOff'
import AddAlertIcon from '@mui/icons-material/AddAlert'
import { subDays, isAfter, parseISO } from 'date-fns'
import CreateAlertModal from './create-alert-modal'
import { fetchAlerts, createAlert, deleteAlert } from '../../../redux/slice/alert-slice/alert-slice'

export default function RepeatOffenderTickets() {
    const dispatch = useDispatch()
    const { tickets = [] } = useSelector((state) => state.tickets)
    const { companies = [] } = useSelector((state) => state.companies)
    const { monitoredStores = [] } = useSelector((state) => state.alerts || {})

    const [openFilters, setOpenFilters] = useState(false)
    const [showAlertPanel, setShowAlertPanel] = useState(false)
    const [openAlertModal, setOpenAlertModal] = useState(false)

    const [days, setDays] = useState(7)
    const [selectedGroup, setSelectedGroup] = useState('todos')
    const [selectedStore, setSelectedStore] = useState('Todas as Lojas')
    const [selectedTag, setSelectedTag] = useState('TODOS')

    useEffect(() => {
        dispatch(fetchAlerts())
    }, [dispatch])

    // Lógica para abrir o painel se houver alertas
    useEffect(() => {
        if (monitoredStores.length > 0) {
            setShowAlertPanel(true)
        } else {
            setShowAlertPanel(false)
        }
    }, [monitoredStores])

    const normalize = (text) => text?.toString().toUpperCase().trim() || ""

    const handleAddAlert = (newAlert) => {
        dispatch(createAlert(newAlert))
    }

    const handleDeleteAlert = (id) => {
        dispatch(deleteAlert(id))
    }

    useEffect(() => {
        setSelectedStore('Todas as Lojas')
    }, [selectedGroup])

    const groupedMonitored = useMemo(() => {
        if (!Array.isArray(monitoredStores)) return {}
        
        return monitoredStores.reduce((acc, curr) => {
            if (!curr) return acc
            // Corrigido para group_name (nome no seu banco)
            const groupName = curr.group_name || 'Geral'
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
            const grupoKey = String(t.company_id) 
            const lojaKey = t.cliente?.toLowerCase() || "unidade única"
            const tagKey = t.classificacao

            if (!estrutura[grupoKey]) estrutura[grupoKey] = {}
            if (!estrutura[grupoKey][lojaKey]) estrutura[grupoKey][lojaKey] = {}
            if (!estrutura[grupoKey][lojaKey][tagKey]) {
                estrutura[grupoKey][lojaKey][tagKey] = { tickets: [], total: 0 }
            }
            estrutura[grupoKey][lojaKey][tagKey].tickets.push(t)
            estrutura[grupoKey][lojaKey][tagKey].total += 1
        })

        const resultado = {}
        Object.entries(estrutura).forEach(([grupoId, lojas]) => {
            Object.entries(lojas).forEach(([loja, tags]) => {
                Object.entries(tags).forEach(([tag, dados]) => {
                    if (dados.total > 2) {
                        if (!resultado[grupoId]) resultado[grupoId] = []
                        resultado[grupoId].push({
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

    const getActionBadge = (acao) => {
        if (!acao) return null
        const lowerAcao = acao.toLowerCase()
        let bgColor = '#89f98c'
        
        if (lowerAcao.includes('crítica')) {
            bgColor = '#ff9800'
        } else if (lowerAcao.includes('urgente')) {
            bgColor = 'var(--color-highlight)'
        }

        return (
            <Chip 
                label={acao} 
                size="small" 
                sx={{ 
                    fontSize: '0.55rem', 
                    height: 18, 
                    bgcolor: bgColor, 
                    color: 'white', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                }} 
            />
        )
    }

    return (
        <Paper elevation={3} sx={{ borderRadius: 1, overflow: 'hidden', minHeight: '450px', bgcolor: '#fff' }}>
            <Box sx={{ p: 1, bgcolor: '#fff', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Casos Reincidentes</Typography>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Criar Alerta de Loja">
                        <IconButton size="small" onClick={() => setShowAlertPanel(!showAlertPanel)} sx={{ color: showAlertPanel ? 'var(--color-highlight)' : '#1976d2' }}>
                            <AddAlertIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={openFilters ? "Fechar Filtros" : "Abrir Filtros"}>
                        <IconButton size="small" onClick={() => setOpenFilters(!openFilters)} sx={{ color: openFilters ? 'var(--color-highlight)' : '#1976d2' }}>
                            {openFilters ? <FilterListOffIcon fontSize="small" /> : <FilterListIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            <Box sx={{ p: 2 }}>
                <Collapse in={showAlertPanel}>
                    <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 4, height: 18, bgcolor: 'var(--color-highlight)', borderRadius: 1 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333' }}>Lojas em monitoramento</Typography>
                            </Box>
                            <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setOpenAlertModal(true)} sx={{ textTransform: 'none', borderColor: 'var(--color-highlight)', color: 'var(--color-highlight)' }}>Novo Alerta</Button>
                        </Stack>

                        <Stack spacing={2}>
                            {monitoredStores.length === 0 && (
                                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>Nenhuma loja configurada para monitoramento.</Typography>
                            )}
                            {Object.entries(groupedMonitored).map(([groupName, stores], idx) => (
                                <Box key={idx}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', ml: 0.5, textTransform: 'capitalize', display: 'block', mb: 0.5 }}>{groupName.toLowerCase()}</Typography>
                                    <Stack spacing={1}>
                                        {stores.map((store, sIdx) => {
                                            // Corrigido para group_id (nome no seu banco)
                                            const grupoId = String(store.group_id || store.company_id)
                                            const grupoData = reincidentes[grupoId] || []
                                            // Corrigido para store_name (nome no seu banco)
                                            const infoLoja = grupoData.find(item => normalize(item.loja) === normalize(store.store_name) && (normalize(store.tag) === 'TODAS' || normalize(item.tag) === normalize(store.tag)))
                                            const totalTickets = infoLoja ? infoLoja.total : 0
                                            return (
                                                <Paper key={sIdx} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff' }}>
                                                    <Box>
                                                        {/* Corrigido para store_name */}
                                                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'capitalize' }}>{store.store_name?.toLowerCase()}</Typography>
                                                        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Tag: <Box component="span" sx={{ color: 'var(--color-highlight)', fontWeight: 'bold', textTransform:'capitalize' }}>{store.tag?.toLowerCase()}</Box></Typography>
                                                        {/* Corrigido para action_type */}
                                                        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>Ação: <Box component="span" sx={{ color: 'var(--color-highlight)', fontWeight: 'bold', textTransform:'capitalize' }}>{store.action_type?.toLowerCase()}</Box></Typography>
                                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: '500', color: totalTickets > 0 ? 'var(--color-highlight)' : 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                            Status: {totalTickets > 0 ? `${totalTickets} ticket(s) encontrado(s)` : 'Nenhum chamado encontrado'}
                                                        </Typography>
                                                    </Box>
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <IconButton size="small" color="error" onClick={() => handleDeleteAlert(store.id)}><DeleteOutlineIcon fontSize="small" /></IconButton>
                                                    </Stack>
                                                </Paper>
                                            )
                                        })}
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                </Collapse>

                <Collapse in={openFilters}>
                    <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Box sx={{ width: 4, height: 18, bgcolor: 'var(--color-highlight)', borderRadius: 1 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#333' }}>Filtro de chamados reincidentes</Typography>
                            </Stack>
                            <ToggleButtonGroup value={days} exclusive onChange={(e, val) => val && setDays(val)} size="small" sx={{ height: 25, '& .MuiToggleButton-root': { fontSize: '0.65rem', px: 1.5, textTransform: 'capitalize', fontWeight: 'bold', border: '1px solid #eee', bgcolor: 'white', '&.Mui-selected': { backgroundColor: 'var(--color-highlight)', color: 'white' } } }}>
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
                                    <Select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} sx={{ fontSize: '0.75rem', height: 32, bgcolor: '#f9f9f9', border: '1px solid #eee', color: selectedGroup !== 'todos' ? 'var(--color-highlight)' : 'inherit', fontWeight: selectedGroup !== 'todos' ? 'bold' : 'normal', textTransform: 'capitalize' }}>
                                        <MenuItem value="todos" sx={{ fontSize: '0.75rem' }}>Todos os Grupos</MenuItem>
                                        {filterOptions.groups.map(g => <MenuItem key={g.id} value={g.id} sx={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{g.name.toLowerCase()}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4} md={3}>
                                <FormControl fullWidth size="small">
                                    <Select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)} disabled={selectedGroup === 'todos'} sx={{ fontSize: '0.75rem', height: 32, bgcolor: '#f9f9f9', border: '1px solid #eee', color: selectedStore !== 'Todas as Lojas' ? 'var(--color-highlight)' : 'inherit', fontWeight: selectedStore !== 'Todas as Lojas' ? 'bold' : 'normal', textTransform: 'capitalize' }}>
                                        <MenuItem value="Todas as Lojas" sx={{ fontSize: '0.75rem' }}>Todas as Lojas</MenuItem>
                                        {filterOptions.stores.map(s => <MenuItem key={s} value={s} sx={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{s.toLowerCase()}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4} md={3}>
                                <FormControl fullWidth size="small">
                                    <Select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} sx={{ fontSize: '0.75rem', height: 32, bgcolor: '#f9f9f9', border: '1px solid #eee', color: selectedTag !== 'TODOS' ? 'var(--color-highlight)' : 'inherit', fontWeight: selectedTag !== 'TODOS' ? 'bold' : 'normal' }}>
                                        <MenuItem value="TODOS" sx={{ fontSize: '0.75rem' }}>Todas as Tags</MenuItem>
                                        {filterOptions.tags.map(t => <MenuItem key={t} value={t} sx={{ fontSize: '0.75rem' }}>{t}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                </Collapse>

                {gruposKeys.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed #ccc' }}>
                        <Typography color="text.secondary">Nenhum chamado reincidente encontrado para os filtros selecionados.</Typography>
                    </Box>
                ) : (
                    gruposKeys.map((grupoId) => {
                        const companyObj = companies.find(c => String(c.id) === String(grupoId))
                        const nomeGrupo = companyObj ? companyObj.name : 'Outros'
                        return (
                            <Box key={grupoId} sx={{ mb: 4 }}>
                                <Typography variant="overline" sx={{ display: 'block', mb: 1, borderBottom: '2px solid #eee', textTransform: 'capitalize', fontWeight: '600' }}>Grupo: {nomeGrupo.toLowerCase()}</Typography>
                                <Stack spacing={2}>
                                    {reincidentes[grupoId].map((item, idx) => {
                                        // Corrigido para group_id e store_name
                                        const alerta = monitoredStores.find(m => String(m.group_id) === String(grupoId) && normalize(m.store_name) === normalize(item.loja))
                                        return (
                                            <Box key={idx} sx={{ p: 1.5, border: '1px solid #f0f0f0', borderRadius: 2, '&:hover': { borderColor: '#ccc' } }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                                    <Box>
                                                        <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 'bold', textTransform: 'capitalize' }}>{item.loja}</Typography>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Typography sx={{ fontSize: '0.85rem', fontWeight: '800' }}>{item.tag}</Typography>
                                                        </Stack>
                                                    </Box>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                            {alerta && (
                                                                <>
                                                                    <Chip 
                                                                        label="LOJA EM MONITORAMENTO" 
                                                                        size="small" 
                                                                        variant="outlined" 
                                                                        sx={{ height: 18, fontSize: '0.55rem', fontWeight: 'bold', background: '#0288d1', color: '#f0f0f0' }} 
                                                                    />
                                                                    {/* Corrigido para action_type */}
                                                                    {getActionBadge(alerta.action_type)}
                                                                </>
                                                            )}
                                                        <Chip label={`${item.total}`} size="small" sx={{ fontWeight: 900, background: 'transparent', color: 'var(--color-highlight)', fontSize: '0.65rem' }} />
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
                                                                {new Date(t.data_abertura).toLocaleString('pt-BR')} - ID: {t.ticket} Loja: {t.cliente}
                                                            </Typography>
                                                        ))}
                                                    </AccordionDetails>
                                                </Accordion>
                                            </Box>
                                        )
                                    })}
                                </Stack>
                            </Box>
                        )
                    })
                )}
            </Box>
            <CreateAlertModal open={openAlertModal} onClose={() => setOpenAlertModal(false)} onSave={handleAddAlert} />
        </Paper>
    )
}