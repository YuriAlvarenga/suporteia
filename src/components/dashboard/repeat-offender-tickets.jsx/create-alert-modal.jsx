import React, { useState, useMemo } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, MenuItem, Stack, FormControl, Select } from '@mui/material'
import { useSelector } from 'react-redux'

export default function CreateAlertModal({ open, onClose, onSave }) {
    const { tickets = [] } = useSelector((state) => state.tickets)
    const { companies = [] } = useSelector((state) => state.companies)

    const [selectedGroup, setSelectedGroup] = useState('')
    const [selectedStore, setSelectedStore] = useState('')
    const [selectedTag, setSelectedTag] = useState('Todas as Tags')
    const [selectedAction, setSelectedAction] = useState('Acompanhamento - Trivial')

    const options = useMemo(() => {
        const tags = new Set()
        const storesSet = new Set()

        const ticketsForStores = !selectedGroup 
            ? [] 
            : tickets.filter(t => String(t.company_id) === String(selectedGroup))

        ticketsForStores.forEach(t => {
            if (t.cliente) storesSet.add(t.cliente)
        })

        tickets.forEach(t => {
            if (t.classificacao) tags.add(t.classificacao)
        })

        return {
            groups: companies,
            stores: Array.from(storesSet).sort(),
            tags: ['Todas as Tags', ...Array.from(tags).sort()]
        }
    }, [tickets, companies, selectedGroup])

    const handleSave = () => {
        const groupObj = companies.find(c => String(c.id) === String(selectedGroup))
        
        const novoAlerta = {
            // AJUSTE: Garantindo que a chave seja 'groupId' para alinhar com o componente principal
            groupId: String(selectedGroup), 
            groupName: groupObj ? groupObj.name : 'Geral',
            name: selectedStore,
            tag: selectedTag === 'Todas as Tags' ? 'TODAS' : selectedTag,
            acao: selectedAction,
            dataCriacao: new Date().toISOString()
        }

        if (onSave) onSave(novoAlerta)
        
        setSelectedGroup('')
        setSelectedStore('')
        setSelectedTag('Todas as Tags')
        setSelectedAction('Acompanhamento - Trivial')
        if (onClose) onClose()
    }

    const isFormValid = selectedGroup !== '' && selectedStore !== ''

    const selectStyle = (value, isDefault) => ({
        fontSize: '0.75rem',
        height: 32,
        bgcolor: '#f9f9f9',
        border: '1px solid #eee',
        color: value !== isDefault ? 'var(--color-highlight)' : 'inherit',
        fontWeight: value !== isDefault ? 'bold' : 'normal',
        textTransform: 'capitalize'
    })

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                Configurar Novo Alerta
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    
                    <FormControl fullWidth size="small">
                        <Select
                            value={selectedGroup}
                            displayEmpty
                            onChange={(e) => {
                                setSelectedGroup(e.target.value)
                                setSelectedStore('') 
                            }}
                            sx={selectStyle(selectedGroup, '')}
                        >
                            <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Grupo (Obrigatório)</MenuItem>
                            {options.groups.map(g => (
                                <MenuItem key={g.id} value={g.id} sx={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                                    {g.name.toLowerCase()}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" disabled={!selectedGroup}>
                        <Select
                            value={selectedStore}
                            displayEmpty
                            onChange={(e) => setSelectedStore(e.target.value)}
                            sx={selectStyle(selectedStore, '')}
                        >
                            <MenuItem value="" disabled sx={{ fontSize: '0.75rem' }}>Unidade / Loja (Obrigatório)</MenuItem>
                            {options.stores.length === 0 && selectedGroup && (
                                <MenuItem disabled sx={{ fontSize: '0.75rem' }}>Nenhuma loja encontrada</MenuItem>
                            )}
                            {options.stores.map(s => (
                                <MenuItem key={s} value={s} sx={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>
                                    {s.toLowerCase()}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                        <Select
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                            sx={selectStyle(selectedTag, 'Todas as Tags')}
                        >
                            {options.tags.map(tag => (
                                <MenuItem key={tag} value={tag} sx={{ fontSize: '0.75rem' }}>{tag}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                        <Select
                            value={selectedAction}
                            onChange={(e) => setSelectedAction(e.target.value)}
                            sx={selectStyle(selectedAction, '')}
                        >
                            <MenuItem value="Acompanhamento - Trivial" sx={{ fontSize: '0.75rem' }}>Acompanhamento - Trivial</MenuItem>
                            <MenuItem value="Abrir chamado com Tech - Crítica" sx={{ fontSize: '0.75rem' }}>Abrir chamado com Tech - Crítica</MenuItem>
                            <MenuItem value="Abrir chamado com Tech - Urgente" sx={{ fontSize: '0.75rem' }}>Abrir chamado com Tech - Urgente</MenuItem>
                        </Select>
                    </FormControl>

                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} sx={{ textTransform: 'none', fontSize: '0.85rem' }}>
                    Cancelar
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={!isFormValid}
                    sx={{ 
                        bgcolor: 'var(--color-highlight)', 
                        '&:disabled': { bgcolor: 'rgba(0, 0, 0, 0.12)' }, 
                        textTransform: 'none',
                        fontSize: '0.85rem',
                        '&:hover': { bgcolor: 'var(--color-highlight)', filter: 'brightness(0.9)' }
                    }}
                >
                    Criar Alerta
                </Button>
            </DialogActions>
        </Dialog>
    )
}