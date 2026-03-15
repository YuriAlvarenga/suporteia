import React from 'react'
import {  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,  FormControl, RadioGroup, FormControlLabel, Radio, Button } from '@mui/material'

export default function ClassificationModal({ 
    open, 
    onClose, 
    tags, 
    classification, 
    setClassification, 
    onConfirm 
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', pb: 0 }}>
                Classificar Chamado
            </DialogTitle>

            <DialogContent>
                <DialogContentText sx={{ mb: 3, textAlign: 'center' }}>
                    Selecione a justificativa para encerrar o chamado:
                </DialogContentText>

                <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup
                        value={classification}
                        onChange={(e) => setClassification(e.target.value)}
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 1,
                        }}
                    >
                        {tags.map((tag) => (
                            <FormControlLabel
                                key={tag}
                                value={tag}
                                control={<Radio color="error" size="small" />}
                                label={tag}
                                sx={{
                                    '& .MuiFormControlLabel-label': {
                                        fontSize: '0.85rem',
                                    }
                                }}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            </DialogContent>

            <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
                <Button
                    onClick={onClose}
                    sx={{ color: '#666', textTransform: 'none' }}
                >
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