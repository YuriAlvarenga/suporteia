import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormControl, RadioGroup, FormControlLabel, Radio, Button, Box, Typography, Checkbox } from '@mui/material'

export default function ClassificationModal({  open, onClose, tags, classification, setClassification, onConfirm, indevido, setIndevido }) {

    // Agrupa as tags pelo prefixo
    const groupedTags = tags.reduce((acc, tag) => {
        const prefix = tag.split('.')[0] || 'Outros'
        if (!acc[prefix]) acc[prefix] = []
        acc[prefix].push(tag)
        return acc
    }, {})

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', pb: 0 }}>
                Classificar Chamado
            </DialogTitle>

            <DialogContent>
                <DialogContentText sx={{ mb: 3, textAlign: 'center' }}>
                    Selecione a justificativa para encerrar o chamado:
                </DialogContentText>

                <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup value={classification} onChange={(e) => setClassification(e.target.value)}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {Object.entries(groupedTags).map(([group, items]) => (
                                <Box key={group}>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            fontWeight: 'bold', 
                                            color: 'text.secondary', 
                                            borderBottom: '1px solid #eee', 
                                            display: 'block', 
                                            mb: 1 
                                        }}
                                    >
                                        {group}
                                    </Typography>
                                    <Box 
                                        sx={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(3, 1fr)', // CORRIGIDO: camelCase aqui
                                            gap: 1 
                                        }}
                                    >
                                        {items.map((tag) => (
                                            <FormControlLabel
                                                key={tag}
                                                value={tag}
                                                control={<Radio color="error" size="small" />}
                                                label={tag}
                                                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </RadioGroup>
                </FormControl>
            </DialogContent>

            <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2, position: 'relative' }}>
                <FormControlLabel
                    control={
                        <Checkbox 
                            checked={indevido} 
                            onChange={(e) => setIndevido(e.target.checked)} 
                            size="small"
                        />
                    }
                    label="Indevido"
                    sx={{ 
                        position: 'absolute', 
                        left: 24, 
                        '& .MuiFormControlLabel-label': { fontSize: '0.85rem' } 
                    }}
                />

                <Button onClick={onClose} sx={{ color: '#666', textTransform: 'none' }}>
                    Cancelar
                </Button>
                <Button 
                    onClick={onConfirm} 
                    variant="contained" 
                    disabled={!classification} 
                    sx={{ 
                        bgcolor: '#7b1616', 
                        '&:hover': { bgcolor: '#5a1010' }, 
                        textTransform: 'none', 
                        px: 6 
                    }}
                >
                    Encerrar
                </Button>
            </DialogActions>
        </Dialog>
    )
}