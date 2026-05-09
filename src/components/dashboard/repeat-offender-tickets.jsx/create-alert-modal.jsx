import React, { useState, useMemo } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack, Autocomplete } from '@mui/material'
import { useSelector } from 'react-redux'

// Adicionamos a prop onSave que vem do Pai
export default function CreateAlertModal({ open, onClose, onSave }) {
    const { tickets } = useSelector((state) => state.tickets)

    // Estados do formulário
    const [selectedGroup, setSelectedGroup] = useState('')
    const [selectedStore, setSelectedStore] = useState('Todas as Lojas')
    const [selectedTag, setSelectedTag] = useState('Todas as Tags')

    // Extração de opções dinâmicas (Mantido conforme seu original)
    const options = useMemo(() => {
        const groups = new Set()
        const stores = new Set()
        const tags = new Set()

        if (!tickets) return { groups: [], stores: ['Todas as Lojas'], tags: ['Todas as Tags'] }

        tickets.forEach(t => {
            const [grupo, ...loja] = (t.cliente || '').split(' - ')
            if (grupo) groups.add(grupo.toUpperCase().trim())
            if (loja.length > 0) stores.add(loja.join(' - ').trim())
            if (t.classificacao) tags.add(t.classificacao)
        })

        return {
            groups: Array.from(groups).sort(),
            stores: ['Todas as Lojas', ...Array.from(stores).sort()],
            tags: ['Todas as Tags', ...Array.from(tags).sort()]
        }
    }, [tickets])

    const handleSave = () => {
        // Criamos o objeto no formato esperado pelo componente RepeatOffenderTickets
        const novoAlerta = {
            group: selectedGroup,        // Usado para o agrupamento visual
            name: selectedStore,         // Usado para o título do card
            tag: selectedTag === 'Todas as Tags' ? 'TODAS' : selectedTag, // Padronização da tag
            dataCriacao: new Date().toISOString()
        }

        // 1. Envia para o Pai (DashboardTickets) salvar no estado
        if (onSave) {
            onSave(novoAlerta)
        }
        
        // 2. Limpa o formulário para a próxima criação
        setSelectedGroup('')
        setSelectedStore('Todas as Lojas')
        setSelectedTag('Todas as Tags')

        // 3. Fecha o modal
        onClose()
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                Configurar Novo Alerta
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3} sx={{ mt: 1 }}>

                    <TextField
                        select
                        fullWidth
                        label="Grupo"
                        size="small"
                        value={selectedGroup}
                        onChange={(e) => {
                            setSelectedGroup(e.target.value)
                            setSelectedStore('Todas as Lojas')
                        }}
                    >
                        {options.groups.map(g => (
                            <MenuItem key={g} value={g}>{g}</MenuItem>
                        ))}
                    </TextField>

                    <Autocomplete
                        size="small"
                        options={options.stores}
                        value={selectedStore}
                        onChange={(event, newValue) => setSelectedStore(newValue || 'Todas as Lojas')}
                        renderInput={(params) => <TextField {...params} label="Unidade / Loja" />}
                    />

                    <TextField
                        select
                        fullWidth
                        label="Tag / Classificação"
                        size="small"
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                    >
                        {options.tags.map(tag => (
                            <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                        ))}
                    </TextField>

                </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onClose}
                    sx={{ textTransform: 'none' }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={!selectedGroup}
                    sx={{ 
                        bgcolor: 'var(--color-highlight)', 
                        '&:disabled': { bgcolor: 'rgba(0, 0, 0, 0.12)' }, 
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'var(--color-highlight)', filter: 'brightness(0.9)' }
                    }}
                >
                    Criar Alerta
                </Button>
            </DialogActions>
        </Dialog>
    )
}