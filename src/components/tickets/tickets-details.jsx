import React, { useState, useEffect } from 'react'
import { Drawer, Box, Typography, IconButton, Divider, Stack, Fade, Alert, Button, TextField } from '@mui/material'
import { Close as CloseIcon, ContentCopy as ContentCopyIcon, Check as CheckIcon, Edit as EditIcon} from '@mui/icons-material'
import LinkIcon from '@mui/icons-material/Link' 

export default function TicketDetailsDrawer({ open, onClose, ticket, tabValue, copySuccess, onCopy, onCloseTicket, capitalizeName, onSaveObservation, onSaveLink }) {

    const [observation, setObservation] = useState('')
    const [isEditing, setIsEditing] = useState(false)

    // Estados para o Link
    const [link, setLink] = useState('')
    const [isEditingLink, setIsEditingLink] = useState(false)

    // Sincroniza quando o ticket muda ou abre
    useEffect(() => {
        if (ticket) {
            setObservation(ticket.observacoes || '')
            setLink(ticket.link || '') // Sincroniza com a nova coluna 'link'
            setIsEditing(false)
            setIsEditingLink(false)
        }
    }, [ticket, open])

    if (!ticket) return null

    const isReadOnly = tabValue === 1

    // AÇÕES DE OBSERVAÇÃO
    const handleSave = async () => {
        if (onSaveObservation) {
            await onSaveObservation(ticket.id, observation)
        }
        setIsEditing(false)
    }

    // AÇÕES DE LINK - Envia para o banco via props
    const handleSaveLink = async () => {
        if (onSaveLink) {
            await onSaveLink(ticket.id, link) // Aqui ele dispara a atualização no Supabase
        }
        setIsEditingLink(false)
    }

    const handleOpenLink = () => {
        if (link) {
            const formattedLink = link.startsWith('http') ? link : `https://${link}`
            window.open(formattedLink, '_blank')
        }
    }

    return (
        <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 400, p: 3 } }}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', top: -20, right: -18, '&:hover': { color: '#fb0b0b' } }}>
                    <CloseIcon />
                </IconButton>

                <Typography fontWeight="bold" color="primary" sx={{ mb: 1, mt: 2 }}>
                    Detalhes do Ticket #{ticket.ticket}
                </Typography>

                <Fade in={copySuccess} unmountOnExit>
                    <Box sx={{ mt: 1, mb: 1 }}>
                        <Alert severity="success" variant="filled" sx={{ py: 0, fontSize: '0.75rem' }}>
                            Dados copiados com sucesso!
                        </Alert>
                    </Box>
                </Fade>

                <Divider />

                <Stack spacing={2} sx={{ flexGrow: 1, overflowY: 'auto', mt: 2, pr: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {tabValue === 0 && (
                            <Typography sx={{ color: 'var(--color-highlight)' }}>Chamado em Andamento</Typography>
                        )}
                        {tabValue === 1 && (
                            <Typography sx={{ color: 'var(--color-highlight)' }}>Chamado Encerrado</Typography>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <IconButton color="primary" onClick={onCopy} title="Copiar dados">
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="#000000" fontWeight="bold">Nome Fantasia</Typography>
                        <Typography variant="body1" color='text.secondary'>{capitalizeName(ticket.cliente)}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="#000000" fontWeight="bold">CNPJ</Typography>
                        <Typography variant="body1" color='text.secondary'>{ticket.cnpj}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="#000000" fontWeight="bold">Motivo</Typography>
                        <Typography variant="body1" color='text.secondary'>{ticket.mensagem || 'Não informado'}</Typography>
                    </Box>

                    {/* QUADRO DE OBSERVAÇÕES */}
                    <Box>
                        <Typography variant="caption" color="#000000" fontWeight="bold" sx={{ display: 'block' }}>
                            Observações
                        </Typography>
                        <TextField
                            multiline
                            rows={3}
                            fullWidth
                            placeholder={isReadOnly ? "Sem observações." : "Notas internas"}
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            onFocus={() => !isReadOnly && setIsEditing(true)}
                            disabled={isReadOnly || (!isEditing && observation.length > 0)}
                            variant={isReadOnly ? "standard" : "outlined"}
                            InputProps={{
                                ...(isReadOnly ? { disableUnderline: true } : {}),
                                sx: {
                                    fontSize: '0.8rem',
                                    color: (isReadOnly || !isEditing) ? '#888' : '#555',
                                    WebkitTextFillColor: (isReadOnly || !isEditing) ? '#888' : '#555'
                                }
                            }}
                            sx={{ mb: 1 }}
                        />

                        {!isReadOnly && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', opacity: 0.8, '&:hover': { opacity: 1 }, transition: '0.2s', minHeight: '30px' }}>
                                {isEditing ? (
                                    <>
                                        <IconButton
                                            onClick={() => {
                                                setObservation(ticket.observacoes || '');
                                                setIsEditing(false);
                                            }}
                                            sx={{ color: 'var(--color-highlight)' }}
                                            size="small"
                                            title="Cancelar edição"
                                        >
                                            <CloseIcon fontSize="inherit" />
                                        </IconButton>
                                        <IconButton
                                            onClick={handleSave}
                                            sx={{ color: '#1976d2' }}
                                            size="small"
                                            title="Salvar"
                                        >
                                            <CheckIcon fontSize="inherit" />
                                        </IconButton>
                                    </>
                                ) : (
                                    observation.length > 0 && (
                                        <IconButton
                                            onClick={() => setIsEditing(true)}
                                            sx={{ color: '#1976d2' }}
                                            size="small"
                                            title="Editar observação"
                                        >
                                            <EditIcon fontSize="inherit" />
                                        </IconButton>
                                    )
                                )}
                            </Box>
                        )}
                    </Box>

                    {/* QUADRO DE LINK */}
                    <Box>
                        <Typography variant="caption" color="#000000" fontWeight="bold" sx={{ display: 'block' }}>
                            Link Associado
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder={isReadOnly ? "Sem link." : "http://..."}
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            onFocus={() => !isReadOnly && setIsEditingLink(true)}
                            disabled={isReadOnly || (!isEditingLink && link.length > 0)}
                            variant={isReadOnly ? "standard" : "outlined"}
                            InputProps={{
                                ...(isReadOnly ? { disableUnderline: true } : {}),
                                sx: {
                                    fontSize: '0.75rem',
                                    color: (isReadOnly || !isEditingLink) ? '#888' : '#555',
                                    WebkitTextFillColor: (isReadOnly || !isEditingLink) ? '#888' : '#555',
                                    height: '32px'
                                }
                            }}
                            sx={{ mb: 0.5 }}
                        />

                        {!isReadOnly && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', opacity: 0.8, '&:hover': { opacity: 1 }, transition: '0.2s', minHeight: '25px' }}>
                                {isEditingLink ? (
                                    <>
                                        <IconButton
                                            onClick={() => {
                                                setLink(ticket.link || '');
                                                setIsEditingLink(false);
                                            }}
                                            sx={{ color: 'var(--color-highlight)' }}
                                            size="small"
                                            title="Cancelar"
                                        >
                                            <CloseIcon sx={{ fontSize: '1.1rem' }} />
                                        </IconButton>
                                        <IconButton
                                            onClick={handleSaveLink}
                                            sx={{ color: '#1976d2' }}
                                            size="small"
                                            title="Salvar"
                                        >
                                            <CheckIcon sx={{ fontSize: '1.1rem' }} />
                                        </IconButton>
                                    </>
                                ) : (
                                    link.length > 0 && (
                                        <>
                                            <IconButton
                                                onClick={handleOpenLink}
                                                sx={{ color: 'var(--color-highlight)', mr: 0.5 }}
                                                size="small"
                                                title="Abrir link"
                                            >
                                                <LinkIcon sx={{ fontSize: '1.1rem' }} />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => setIsEditingLink(true)}
                                                sx={{ color: '#1976d2' }}
                                                size="small"
                                                title="Editar"
                                            >
                                                <EditIcon sx={{ fontSize: '1.1rem' }} />
                                            </IconButton>
                                        </>
                                    )
                                )}
                            </Box>
                        )}
                    </Box>

                    {/* DADOS ESPECÍFICOS DE TICKETS FECHADOS */}
                    {tabValue === 1 && (
                        <React.Fragment>
                            <Box>
                                <Typography variant="caption" color="#000000" fontWeight="bold">RESUMO</Typography>
                                <Typography variant="body2" sx={{ mt: 1, p: 1.5, color: 'text.secondary', bgcolor: '#f5f5f5', borderRadius: 1, whiteSpace: 'pre-line' }}>
                                    {ticket.resumo || 'Sem resumo disponível.'}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="#000000" fontWeight="bold">CLASSIFICAÇÃO</Typography>
                                <Typography variant="body2" sx={{ mt: 1, p: 1, color: '#7b1616', bgcolor: '#fff5f5', borderRadius: 1, fontWeight: 'bold', border: '1px solid #7b1616' }}>
                                    {ticket.classificacao || 'Não classificado'}
                                </Typography>
                            </Box>
                            {ticket.responsavel && (
                                <Box>
                                    <Typography variant="caption" color="#000000" fontWeight="bold">ENCERRADO POR</Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                                        {ticket.responsavel}
                                    </Typography>
                                </Box>
                            )}
                        </React.Fragment>
                    )}
                </Stack>

                {tabValue === 0 && (
                    <Box sx={{ mt: 'auto', pt: 2 }}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => onCloseTicket(ticket.id)}
                            sx={{ textTransform: 'none', bgcolor: 'var(--color-highlight)', '&:hover': { bgcolor: 'var(--color-highlight)' } }}
                        >
                            Encerrar Ticket
                        </Button>
                    </Box>
                )}
            </Box>
        </Drawer>
    )
}