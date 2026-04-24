import React, { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
    Box, Typography, Stack, LinearProgress, Accordion, AccordionSummary,
    AccordionDetails, Chip, FormControl, InputLabel, Select, MenuItem, Grid,
    Autocomplete, TextField, Collapse, Button, Divider, Paper, IconButton, ToggleButtonGroup, ToggleButton
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AddIcon from '@mui/icons-material/Add'
import StorefrontIcon from '@mui/icons-material/Storefront'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

// Adicionamos a prop monitoredStores que vem do componente DashboardTickets
export default function RepeatOffenderTickets({ showFilters, showAlerts, onOpenModal, monitoredStores = [] }) {
    const { tickets } = useSelector((state) => state.tickets)

    const [days, setDays] = useState(45)
    const [selectedGroup, setSelectedGroup] = useState('Todos os Grupos')
    const [selectedStore, setSelectedStore] = useState('Todas as Lojas')
    const [selectedTag, setSelectedTag] = useState('TODOS')

    const normalize = (text) => text?.toString().toUpperCase().trim() || "";

    // --- AJUSTE: Agrupamento Dinâmico ---
    const groupedMonitored = useMemo(() => {
        return monitoredStores.reduce((acc, curr) => {
            // Usamos o group que vem do objeto criado no modal
            const groupName = curr.group || 'Geral'
            if (!acc[groupName]) acc[groupName] = []
            acc[groupName].push(curr)
            return acc
        }, {})
    }, [monitoredStores])

    const filterOptions = useMemo(() => {
        const groups = new Set()
        const stores = new Set()
        const tags = new Set()
        if (!tickets) return { groups: [], stores: ['Todas as Lojas'], tags: [] }
        tickets.forEach(t => {
            const [grupo, ...loja] = (t.cliente || '').split(' - ')
            if (grupo) groups.add(grupo.toUpperCase().trim())
            if (loja.length > 0) stores.add(loja.join(' - ').trim())
            if (t.classificacao) tags.add(t.classificacao)
        })
        return {
            groups: Array.from(groups).sort(),
            stores: ['Todas as Lojas', ...Array.from(stores).sort()],
            tags: Array.from(tags).sort()
        }
    }, [tickets])

    const reincidentes = useMemo(() => {
        if (!tickets || tickets.length === 0) return {}
        const hoje = new Date()
        const dataCorte = new Date()
        dataCorte.setDate(hoje.getDate() - days)

        const filtrados = tickets.filter(t => {
            const dataTicket = new Date(t.data_abertura)
            const dentroDoPrazo = dataTicket >= dataCorte
            const temClassificacao = !!t.classificacao
            const [g, ...l] = (t.cliente || '').split(' - ')
            const grupoNome = g?.toUpperCase().trim()
            const lojaNome = l.join(' - ').trim()
            const matchGroup = selectedGroup === 'Todos os Grupos' || grupoNome === selectedGroup
            const matchStore = selectedStore === 'Todas as Lojas' || lojaNome === selectedStore
            const matchTag = selectedTag === 'TODOS' || t.classificacao === selectedTag
            return dentroDoPrazo && temClassificacao && matchGroup && matchStore && matchTag
        })

        const estrutura = {}
        filtrados.forEach(t => {
            const [g, ...l] = (t.cliente || '').split(' - ')
            const grupoKey = g?.toUpperCase().trim() || 'OUTROS'
            const lojaKey = l.join(' - ').trim() || "UNIDADE ÚNICA"
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
    }, [tickets, days, selectedGroup, selectedStore, selectedTag])

    const gruposKeys = Object.keys(reincidentes)

    return (
        <Box sx={{ p: 1, bgcolor: '#fff', borderRadius: 2 }}>

            {/* PAINEL DE ALERTAS AGRUPADO */}
            <Collapse in={showAlerts}>
                <Box sx={{ mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
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
                        {/* Se não houver lojas, mostra aviso*/}
                        {monitoredStores.length === 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                Nenhuma loja configurada para monitoramento.
                            </Typography>
                        )}

                        {Object.entries(groupedMonitored).map(([groupName, stores], idx) => (
                            <Box key={idx}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', ml: 0.5, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                                    {groupName}
                                </Typography>
                                <Stack spacing={1}>
                                    {stores.map((store, sIdx) => {
                                        // --- LÓGICA DE STATUS DINÂMICO ---
                                        // Buscamos se a loja monitorada existe na lista de tickets reincidentes processados
                                        const grupoData = reincidentes[normalize(groupName)] || []

                                        // Verificamos se a loja E a tag batem (se for 'TODAS' no monitor, ignora o filtro de tag do ticket)
                                        const infoLoja = grupoData.find(item =>
                                            normalize(item.loja) === normalize(store.name) &&
                                            (normalize(store.tag) === 'TODAS' || normalize(item.tag) === normalize(store.tag))
                                        )
                                        const totalTickets = infoLoja ? infoLoja.total : 0

                                        return (
                                            <Paper key={sIdx} variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff' }}>
                                                <Box>
                                                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{store.name}</Typography>
                                                    <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                                                        Tag: <Box component="span" sx={{ color: 'var(--color-highlight)', fontWeight: 'bold' }}>{store.tag}</Box>
                                                    </Typography>

                                                    <Typography sx={{
                                                        fontSize: '0.7rem',
                                                        fontWeight: '500',
                                                        color: totalTickets > 0 ? 'var(--color-highlight)' : 'text.secondary',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 0.5,
                                                        mt: 0.5
                                                    }}>
                                                        Status: {totalTickets > 0
                                                            ? `${totalTickets} ticket(s) encontrado(s)`
                                                            : 'Nenhum chamado encontrado'}
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
                            value={days}
                            exclusive
                            onChange={(e, val) => val && setDays(val)}
                            size="small"
                            sx={{
                                height: 28,
                                '& .MuiToggleButton-root': {
                                    fontSize: '0.65rem',
                                    px: 1.5,
                                    py: 0,
                                    fontWeight: 'bold',
                                    border: '1px solid #eee',
                                    color: '#666', 
                                    transition: 'all 0.3s',
                                    '&.Mui-selected': {
                                        backgroundColor: 'var(--color-highlight)',
                                        color: 'var(--color-white)',
                                        '&:hover': {
                                            backgroundColor: 'var(--color-highlight)',
                                            opacity: 0.9
                                        }
                                    }
                                }
                            }}
                        >
                            {[7, 15, 30, 45, 90].map(d => (
                                <ToggleButton sx={{ textTransform: 'none' }} key={d} value={d}>{d} Dias</ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Stack>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={4} md={2.5}>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedGroup}
                                    onChange={(e) => { setSelectedGroup(e.target.value); setSelectedStore('Todas as Lojas') }}
                                    sx={{ fontSize: '0.75rem', height: 32, bgcolor: '#f9f9f9', '& fieldset': { border: 'none' }, border: '1px solid #eee' }}
                                >
                                    <MenuItem value="Todos os Grupos" sx={{ fontSize: '0.75rem' }}>Todos os Grupos</MenuItem>
                                    {filterOptions.groups.map(g => <MenuItem key={g} value={g} sx={{ fontSize: '0.75rem' }}>{g}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={4} md={2.5}>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedTag}
                                    onChange={(e) => setSelectedTag(e.target.value)}
                                    displayEmpty // Permite mostrar o valor mesmo sem label flutuante
                                    sx={{
                                        fontSize: '0.75rem',
                                        height: 32,
                                        bgcolor: '#f9f9f9',
                                        '& fieldset': { border: 'none' },
                                        border: '1px solid #eee'
                                    }}
                                >
                                    <MenuItem value="TODOS" sx={{ fontSize: '0.75rem' }}>Todas as Tags</MenuItem>
                                    {filterOptions.tags.map(t => (
                                        <MenuItem key={t} value={t} sx={{ fontSize: '0.75rem' }}>{t}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md sx={{ flex: '1 1 auto', minWidth: '250px' }}>
                            <Autocomplete
                                size="small"
                                options={filterOptions.stores}
                                value={selectedStore}
                                onChange={(event, newValue) => setSelectedStore(newValue || 'Todas as Lojas')}
                                renderInput={(params) => (
                                    <TextField {...params} placeholder="Buscar Unidade / Loja" variant="outlined"
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                fontSize: '0.75rem',
                                                height: 32,
                                                bgcolor: '#f9f9f9',
                                                '& fieldset': { border: 'none' }
                                            },
                                            border: '1px solid #eee',
                                            borderRadius: 1
                                        }}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Collapse>

            {/* LISTAGEM DE OCORRÊNCIAS */}
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
                                            <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 'bold' }}>{item.loja}</Typography>
                                            <Typography sx={{ fontSize: '0.85rem', fontWeight: '800' }}>{item.tag}</Typography>
                                        </Box>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            {/* LÓGICA DE PONTO VERMELHO PULSANTE SE MONITORADO */}
                                            {monitoredStores.some(m =>
                                                normalize(m.name).includes(normalize(item.loja)) ||
                                                normalize(item.loja).includes(normalize(m.name))
                                            ) && (
                                                    <Box sx={{ width: 8, height: 8, bgcolor: 'var(--color-highlight)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
                                                )}

                                            <Chip
                                                label={`${item.total} Ocorrência (s)`}
                                                size="small"
                                                sx={{
                                                    fontWeight: 900,
                                                    bgcolor: item.total > 3 ? '#ffebee' : '#f5f5f5',
                                                    color: 'var(--color-highlight)',
                                                    fontSize: '0.65rem'
                                                }}
                                            />
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