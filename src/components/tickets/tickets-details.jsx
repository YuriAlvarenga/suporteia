import React from 'react'
import { Drawer, Box, Typography, IconButton, Divider, Stack, Fade, Alert, Button } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

export default function TicketDetailsDrawer({
    open,
    onClose,
    ticket,
    tabValue,
    copySuccess,
    onCopy,
    onCloseTicket,
    capitalizeName
}) {
    if (!ticket) return null

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { width: 400, p: 3 } }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{ position: 'absolute', top: -20, right: -18, '&:hover': { color: '#fb0b0b' } }}
                >
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

                <Stack spacing={1} sx={{ flexGrow: 1, overflowY: 'auto', mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <IconButton color="primary" onClick={onCopy} title="Copiar dados">
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    <Box>
                        <Typography variant="caption" color="#000000" fontWeight="bold">NOME FANTASIA</Typography>
                        <Typography variant="body1" color='text.secondary'>{capitalizeName(ticket.cliente)}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="#000000" fontWeight="bold">CNPJ</Typography>
                        <Typography variant="body1" color='text.secondary'>{ticket.cnpj}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="#000000" fontWeight="bold">TOTEM</Typography>
                        <Typography variant="body1" color='text.secondary'>
                            {Array.isArray(ticket.totem) ? ticket.totem.join(', ') : ticket.totem?.replace(/[\[\]"]/g, '')}
                        </Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="#000000" fontWeight="bold">MOTIVO</Typography>
                        <Typography variant="body1" color='text.secondary'>{ticket.mensagem || 'Não informado'}</Typography>
                    </Box>
                    {tabValue === 1 && (
                        <React.Fragment>
                            <Box>
                                <Typography variant="caption" color="#000000" fontWeight="bold">RESUMO</Typography>
                                <Typography variant="body2" sx={{ mt: 1, p: 1.5, color: 'text.secondary', bgcolor: '#f5f5f5', borderRadius: 1, whiteSpace: 'pre-line' }}>
                                    {ticket.resumo || 'Sem resumo disponível.'}
                                </Typography>
                            </Box>

                            {/* NOVO CAMPO: CLASSIFICAÇÃO */}
                            <Box>
                                <Typography variant="caption" color="#000000" fontWeight="bold">CLASSIFICAÇÃO</Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 1,
                                        p: 1,
                                        color: '#7b1616',
                                        bgcolor: '#fff5f5',
                                        borderRadius: 1,
                                        fontWeight: 'bold',
                                        border: '1px solid #7b1616'
                                    }}
                                >
                                    {ticket.classificacao || 'Não classificado'}
                                </Typography>
                            </Box>
                        </React.Fragment>

                    )}
                </Stack>

                {tabValue === 0 && (
                    <Box sx={{ mt: 'auto', pt: 2 }}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => onCloseTicket(ticket.id)}
                            sx={{
                                textTransform: 'none',
                                bgcolor: '#7b1616',
                                '&:hover': { bgcolor: '#5a1010' }
                            }}
                        >
                            Encerrar Ticket
                        </Button>
                    </Box>
                )}
            </Box>
        </Drawer>
    )
}