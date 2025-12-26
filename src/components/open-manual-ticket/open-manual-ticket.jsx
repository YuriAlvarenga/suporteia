import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import { Button, IconButton, CircularProgress  } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import { useDispatch, useSelector } from 'react-redux'
import { allCompanies } from '../../redux/slice/company-slice/company-slice'


export default function OpenManualTicket({ open, onClose }) { //herdado da página home

    const dispatch = useDispatch()
    const { list: companies, loading } = useSelector(state => state.companies)

    const [selectedCompany, setSelectedCompany] = useState(null)

    // DISPARAR A AÇÃO QUANDO O MODAL ABRIR
    useEffect(() => {
        if (open) {
            dispatch(allCompanies())
        }
    }, [open, dispatch])



    return (
        <Modal open={open} onClose={onClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, bgcolor: 'background.paper', border: '2px solid var(--color-dark)', boxShadow: 24, p: 4 }}>
                <IconButton onClick={onClose} sx={{ position: 'absolute', top: 1, right: 1, color: 'var(--color-highlight)', '&:hover': { color: 'var(--color-highlight)' } }}>
                    <CloseIcon style={{ fontSize: '1rem' }} />
                </IconButton>
                <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 4, fontSize: '1rem' }}>
                    Criar Chamado Manual
                </Typography>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <Autocomplete
                        options={companies}
                        getOptionLabel={(option) => option.name || ''}
                        value={selectedCompany}
                        onChange={(event, newValue) => setSelectedCompany(newValue)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Grupo"
                                variant="standard"
                                sx={{ m: 1 }}
                                InputLabelProps={{ style: { fontSize: '0.9rem' } }}
                            />
                        )}
                    />
                )}
                <TextField label="Loja" variant="standard" sx={{ m: 1 }} InputLabelProps={{ style: { fontSize: '0.9rem' } }} />
                <TextField label="CNPJ" variant="standard" sx={{ m: 1 }} InputLabelProps={{ style: { fontSize: '0.9rem' } }} />
                <TextField label="Totem" variant="standard" sx={{ m: 1 }} InputLabelProps={{ style: { fontSize: '0.9rem' } }} />
                <TextField label="Motivo" variant="standard" sx={{ m: 1 }} InputLabelProps={{ style: { fontSize: '0.9rem' } }} />


                <Box sx={{ display: 'flex', flexDirection: 'row-reverse', mt: 4 }}>
                    <Button variant="contained" sx={{ fontSize: '0.8rem', background: 'var(--color-highlight)', '&:hover': { background: 'red' } }}>
                        Enviar
                    </Button>
                </Box>
            </Box>
        </Modal>
    )
}
