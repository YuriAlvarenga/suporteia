import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
    Box, Paper, Typography, TextField, Button, IconButton, 
    Stack, Skeleton, Divider, Modal, Fade, Backdrop,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle 
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import { fetchAvisos, addAviso, deleteAviso } from '../../../redux/slice/briefing/briefing-slice'

// Estilo do Modal de Criação
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
}

export default function BoardBriefing() {
    const dispatch = useDispatch()
    const { avisos, loading } = useSelector((state) => state.avisos)
    
    // Estados para o Modal de Novo Aviso
    const [open, setOpen] = useState(false)
    const [novoAviso, setNovoAviso] = useState({ titulo: '', conteudo: '' })

    // Estados para o Diálogo de Confirmação (Delete)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [idParaDeletar, setIdParaDeletar] = useState(null)

    useEffect(() => {
        dispatch(fetchAvisos())
    }, [dispatch])

    const handleOpen = () => setOpen(true)

    const handleClose = () => {
        setOpen(false)
        setNovoAviso({ titulo: '', conteudo: '' })
    }

    const handleAdd = async () => {
        if (!novoAviso.titulo || !novoAviso.conteudo) return
        await dispatch(addAviso(novoAviso))
        handleClose()
    }

    // Funções de Controle da Exclusão
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

    return (
        <Box sx={{ p: 0 }}>
            
            {/* CABEÇALHO */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'var(--color-dark)' }}>
                    Briefing
                </Typography>
                
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

            {/* GRID DE AVISOS */}
            <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
                gap: 3 
            }}>
                {loading && avisos.length === 0 ? (
                    [1, 2, 3].map((i) => (
                        <Skeleton 
                            key={i} 
                            variant="rectangular" 
                            height={200} 
                            sx={{ borderRadius: 2 }} 
                        />
                    ))
                ) : (
                    avisos.map((aviso) => (
                        <Paper 
                            key={aviso.id} 
                            elevation={2} 
                            sx={{ 
                                p: 2.5, 
                                position: 'relative',
                                borderTop: '4px solid var(--color-highlight)'
                            }}
                        >
                            {/* BOTÃO X - Agora abre o diálogo customizado */}
                            <IconButton 
                                size="small" 
                                onClick={() => handleDeleteClick(aviso.id)}
                                sx={{ 
                                    position: 'absolute', 
                                    top: 10, 
                                    right: 10 
                                }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                            
                            <Typography 
                                variant="subtitle1" 
                                sx={{ fontWeight: 'bold', pr: 4, mb: 0.5 }}
                            >
                                {aviso.titulo}
                            </Typography>
                            
                            <Typography 
                                variant="caption" 
                                color="text.secondary" 
                                sx={{ display: 'block', mb: 1.5 }}
                            >
                                {new Date(aviso.created_at).toLocaleDateString('pt-BR')}
                            </Typography>
                            
                            <Divider sx={{ mb: 2 }} />
                            
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    whiteSpace: 'pre-line', 
                                    wordBreak: 'normal', 
                                    overflowWrap: 'break-word',
                                    lineHeight: 1.6,
                                    color: 'var(--color-dark)'
                                }}
                            >
                                {aviso.conteudo}
                            </Typography>
                        </Paper>
                    ))
                )}
            </Box>

            {/* MODAL DE CRIAÇÃO */}
            <Modal
                open={open}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{ timeout: 500 }}
            >
                <Fade in={open}>
                    <Box sx={modalStyle}>
                        
                        <IconButton
                            onClick={handleClose}
                            sx={{ 
                                position: 'absolute', 
                                top: 10, 
                                right: 10 
                            }}
                        >
                            <CloseIcon />
                        </IconButton>

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
                                label="Conteúdo (Markdown ou Texto Simples)" 
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

                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end', 
                                mt: 1 
                            }}>
                                <Button 
                                    variant="contained" 
                                    onClick={handleAdd}
                                    sx={{ bgcolor: 'var(--color-highlight)' }}
                                >
                                    Publicar Aviso
                                </Button>
                            </Box>
                        </Stack>

                    </Box>
                </Fade>
            </Modal>

            {/* DIÁLOGO DE CONFIRMAÇÃO DE EXCLUSÃO (MAIS AGRADÁVEL) */}
            <Dialog
                open={confirmOpen}
                onClose={handleConfirmClose}
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja remover este comunicado?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleConfirmClose} sx={{ color: 'text.secondary', textTransform: 'none' }}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleConfirmDelete} 
                        variant="contained" 
                        color="error"
                        autoFocus
                        sx={{ 
                            textTransform: 'none', 
                            borderRadius: 2,
                            boxShadow: 'none'
                        }}
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}