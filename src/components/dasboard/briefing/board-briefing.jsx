import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    Box, Paper, Typography, TextField, Button, IconButton,
    Stack, Skeleton, Divider, Modal, Fade, Backdrop,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material'

import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

import { fetchAvisos, addAviso, deleteAviso } from '../../../redux/slice/briefing/briefing-slice'


const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 3
}


/* CAPITALIZE */
const capitalizeTitle = (text) => {
    if (!text) return ''

    return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}


export default function BoardBriefing() {

    const dispatch = useDispatch()
    const { avisos, loading } = useSelector((state) => state.avisos)
    const { user } = useSelector((state) => state.auth)

    const [open, setOpen] = useState(false)
    const [novoAviso, setNovoAviso] = useState({ titulo: '', conteudo: '' })

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [idParaDeletar, setIdParaDeletar] = useState(null)

    const [expanded, setExpanded] = useState({})


    useEffect(() => {
        if (!avisos.length) {
            dispatch(fetchAvisos())
        }
    }, [dispatch, avisos.length])


    const handleOpen = () => setOpen(true)

    const handleClose = () => {
        setOpen(false)
        setNovoAviso({ titulo: '', conteudo: '' })
    }


    const handleAdd = async () => {
    if (!novoAviso.titulo.trim() || !novoAviso.conteudo.trim()) return

    try {
        const dadosCompletos = {
            ...novoAviso,
            // Enviamos o ID (UUID) que o banco espera, não o e-mail
            created_by: user?.id, 
            cor: '#ffffff'
        }

        await dispatch(addAviso(dadosCompletos)).unwrap()
        handleClose()
    } catch (error) {
        console.error("Erro ao criar aviso:", error)
    }
}


    const handleDeleteClick = (id) => {
        setIdParaDeletar(id)
        setConfirmOpen(true)
    }


    const handleConfirmClose = () => {
        setConfirmOpen(false)
        setIdParaDeletar(null)
    }


    const handleConfirmDelete = () => {
        if (idParaDeletar) {
            dispatch(deleteAviso(idParaDeletar))
        }
        handleConfirmClose()
    }


    const toggleExpand = (id) => {
        setExpanded(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }


    return (
        <Box>

            {/* CABEÇALHO */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleOpen}
                    sx={{
                        bgcolor: 'var(--color-highlight)',
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'var(--color-dark)' }
                    }}
                >
                    Criar Aviso
                </Button>
            </Box>


            {/* GRID */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: 3,
                    alignItems: 'start'
                }}
            >

                {loading && avisos.length === 0 ? (

                    [1, 2, 3].map((i) => (
                        <Skeleton
                            key={i}
                            variant="rectangular"
                            height={220}
                            sx={{ borderRadius: 3 }}
                        />
                    ))

                ) : (

                    avisos.map((aviso) => {

                        const precisaExpandir = (aviso.conteudo || '').length > 180

                        return (

                            <Paper
                                key={aviso.id}
                                elevation={1}
                                sx={{
                                    p: 2.5,
                                    height: expanded[aviso.id] ? 'auto' : 300,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    borderRadius: 3,
                                    border: '1px solid #eee',
                                    transition: 'all 0.2s',
                                    '&:hover': { boxShadow: 3 }
                                }}
                            >

                                <Box>

                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: 'bold', mb: 0.5 }}
                                    >
                                        {capitalizeTitle(aviso.titulo)}
                                    </Typography>


                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        sx={{ mb: 1 }}
                                    >
                                        {/* Lado Esquerdo: Data */}
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(aviso.created_at).toLocaleDateString('pt-BR')}
                                        </Typography>

                                        {/* Lado Direito: Nome do Usuário */}
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                fontWeight: 'bold',
                                                color: 'primary.main',
                                                bgcolor: '#d32f2f',
                                                color: 'white',
                                                px: 1,
                                                borderRadius: 1
                                            }}
                                        >
                                            {aviso.profiles?.full_name || 'Sistema'}
                                        </Typography>
                                    </Stack>


                                    <Divider sx={{ mb: 1.5 }} />


                                    <Typography
                                        variant="body2"
                                        sx={{
                                            lineHeight: 1.7,
                                            color: 'var(--color-dark)',
                                            whiteSpace: 'pre-line',
                                            display: '-webkit-box',
                                            WebkitLineClamp: expanded[aviso.id] ? 'unset' : 4,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {aviso.conteudo}
                                    </Typography>

                                </Box>


                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        mt: 2
                                    }}
                                >

                                    {precisaExpandir ? (

                                        <Button
                                            size="small"
                                            startIcon={
                                                expanded[aviso.id]
                                                    ? <ExpandLessIcon />
                                                    : <ExpandMoreIcon />
                                            }
                                            onClick={() => toggleExpand(aviso.id)}
                                            sx={{
                                                textTransform: 'none',
                                                color: 'var(--color-highlight)'
                                            }}
                                        >
                                            {expanded[aviso.id] ? 'Mostrar menos' : 'Ler mais'}
                                        </Button>

                                    ) : (

                                        <Box />
                                    )}


                                    <IconButton
                                        size="small"
                                        onClick={() => handleDeleteClick(aviso.id)}
                                        sx={{
                                            color: '#777',
                                            '&:hover': { color: '#d32f2f' }
                                        }}
                                    >
                                        <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>

                                </Box>

                            </Paper>

                        )

                    })

                )}

            </Box>


            {/* MODAL */}
            <Modal
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >

                <Fade in={open}>
                    <Box sx={modalStyle}>

                        <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
                            Novo Comunicado
                        </Typography>


                        <Stack spacing={2.5}>

                            <TextField
                                label="Título do Aviso"
                                fullWidth
                                value={novoAviso.titulo}
                                onChange={(e) =>
                                    setNovoAviso({
                                        ...novoAviso,
                                        titulo: e.target.value
                                    })
                                }
                            />


                            <TextField
                                label="Conteúdo"
                                multiline
                                rows={6}
                                fullWidth
                                value={novoAviso.conteudo}
                                onChange={(e) =>
                                    setNovoAviso({
                                        ...novoAviso,
                                        conteudo: e.target.value
                                    })
                                }
                            />


                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>

                                <Button
                                    onClick={handleClose}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Cancelar
                                </Button>

                                <Button
                                    variant="contained"
                                    onClick={handleAdd}
                                    disabled={!novoAviso.titulo.trim() || !novoAviso.conteudo.trim()}
                                    sx={{ bgcolor: 'var(--color-highlight)', '&:disabled': { bgcolor: 'rgba(0, 0, 0, 0.12)' } }}
                                >
                                    Publicar Aviso
                                </Button>

                            </Box>

                        </Stack>

                    </Box>
                </Fade>

            </Modal>


            {/* CONFIRMAR DELETE */}
            <Dialog
                open={confirmOpen}
                onClose={handleConfirmClose}
                PaperProps={{ sx: { borderRadius: 3 } }}
            >

                <DialogTitle>
                    Remover comunicado
                </DialogTitle>


                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja remover este comunicado?
                    </DialogContentText>
                </DialogContent>


                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={handleConfirmClose}
                        sx={{ textTransform: 'none' }}
                    >
                        Cancelar
                    </Button>

                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        color="error"
                        sx={{ textTransform: 'none' }}
                    >
                        Confirmar
                    </Button>
                </DialogActions>

            </Dialog>

        </Box>
    )
}