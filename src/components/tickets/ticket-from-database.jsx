import * as React from 'react'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table, TableBody, TableCell, TableHead, TableRow, Button, Paper, Typography, IconButton, Drawer, Box, Divider, Stack, Skeleton } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CloseIcon from '@mui/icons-material/Close'
import { fetchTickets, updateTicketStatus } from '../../redux/slice/ticket-slice/ticket-slice'
import { useParams, useOutletContext } from 'react-router-dom'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'

const normalizeName = (name) => {
    if (!name) return ''
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim()
}

// Função para Capitalizar o nome da loja
const capitalizeName = (name) => {
    if (!name) return ''
    return name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

export default function Tickets() {
    const dispatch = useDispatch()
    const { companyId } = useParams()
    const { tickets, loading } = useSelector((state) => state.tickets)
    const context = useOutletContext()
    const { tabValue, setCounts, searchTerm } = context || {}

    const [openDrawer, setOpenDrawer] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState(null)

    useEffect(() => {
        dispatch(fetchTickets())
    }, [dispatch])

    const ticketsDaEmpresa = React.useMemo(() => {
        if (!tickets) return []
        if (!companyId) return tickets
        const targetId = normalizeName(companyId)
        return tickets.filter(t => {
            const clienteNormalizado = normalizeName(t.cliente)
            return clienteNormalizado.includes(targetId)
        })
    }, [tickets, companyId])

    useEffect(() => {
        if (setCounts) {
            const pending = ticketsDaEmpresa.filter(t => t.status?.toLowerCase().trim() === "em atendimento").length
            const finished = ticketsDaEmpresa.filter(t => t.status?.toLowerCase().trim() === "finalizado").length
            setCounts({ pending, finished })
        }
    }, [ticketsDaEmpresa, setCounts])

    const filteredTickets = React.useMemo(() => {
        const statusAlvo = tabValue === 0 ? "em atendimento" : "finalizado"

        return ticketsDaEmpresa.filter(t => {
            const matchStatus = t.status?.toLowerCase().trim() === statusAlvo

            if (!searchTerm || searchTerm.trim() === "") {
                return matchStatus
            }

            const searchNormalized = normalizeName(searchTerm)

            const totemString = Array.isArray(t.totem)
                ? t.totem.join(' ')
                : (t.totem || '').toString()

            const matchSearch =
                normalizeName(t.ticket?.toString()).includes(searchNormalized) ||
                normalizeName(t.cliente).includes(searchNormalized) ||
                normalizeName(t.cnpj).includes(searchNormalized) ||
                normalizeName(totemString).includes(searchNormalized)

            return matchStatus && matchSearch
        })
    }, [ticketsDaEmpresa, tabValue, searchTerm])

    const handleViewDetails = (ticket) => {
        setSelectedTicket(ticket)
        setOpenDrawer(true)
    }

    const handleCloseTicket = async (idDoTicket) => {
        try {
            await dispatch(updateTicketStatus({
                id: idDoTicket,
                status: 'Finalizado'
            })).unwrap()
            setOpenDrawer(false)
            setSelectedTicket(null)
        } catch (error) {
            console.error("Erro ao encerrar ticket:", error)
            alert("Erro ao encerrar no banco 'chamados'. Verifique o console.")
        }
    }

    const renderTableSkeletons = () => {
        return [1, 2, 3, 4, 5].map((item) => (
            <TableRow key={item}>
                {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                    <TableCell key={col}>
                        <Skeleton variant="text" height={25} />
                    </TableCell>
                ))}
            </TableRow>
        ))
    }

    const handleCopyTicketData = () => {
        if (!selectedTicket) return

        const totemFormatado = Array.isArray(selectedTicket.totem)
            ? selectedTicket.totem.join(', ')
            : selectedTicket.totem?.replace(/[\[\]"]/g, '')

        const textToCopy = `*NOME FANTASIA:* ${capitalizeName(selectedTicket.cliente)}
        *CNPJ:* ${selectedTicket.cnpj}
        *TOTEM:* ${totemFormatado}
        *MOTIVO:* ${selectedTicket.mensagem || 'Não informado'}`

        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("Dados copiados com sucesso!")
        }).catch(err => {
            console.error('Erro ao copiar:', err)
        })
    }


    return (
        <React.Fragment>
            <Paper elevation={3} sx={{ padding: 2 }}>
                <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                    <TableHead>
                        <TableRow sx={{ background: 'var(--color-highlight)' }}>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Data</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Ticket</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Loja</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>CNPJ</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Totem</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Início</TableCell>
                            {tabValue === 1 && (
                                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Tempo</TableCell>
                            )}
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Ações</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading && tickets.length === 0 ? (
                            renderTableSkeletons()
                        ) : (
                            filteredTickets.map((ticket, index) => {
                                const dataAbertura = ticket.data_abertura.includes('T') ? ticket.data_abertura : ticket.data_abertura.replace(' ', 'T');
                                const dataObj = new Date(dataAbertura);
                                const date = dataObj.toLocaleDateString('pt-BR');
                                const time = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                                return (
                                    <TableRow
                                        key={ticket.id}
                                        hover // Ativa o efeito hover nativo do MUI
                                        sx={{
                                            bgcolor: index % 2 === 0 ? '#f9f9f9' : '#fff',
                                            '&:hover': { backgroundColor: '#f1f1f1 !important' } // Cor sutil personalizada no hover
                                        }}
                                    >
                                        <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{date}</TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{ticket.ticket}</TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{capitalizeName(ticket.cliente)}</TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{ticket.cnpj}</TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                                            {Array.isArray(ticket.totem) ? ticket.totem.join(', ') : ticket.totem?.replace(/[\[\]"]/g, '')}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{time}</TableCell>
                                        {tabValue === 1 && (
                                            <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{ticket.tempo}</TableCell>
                                        )}
                                        <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                                            <IconButton color="primary" title="Visualizar" onClick={() => handleViewDetails(ticket)}>
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </Paper>

            <Drawer
                anchor="right"
                open={openDrawer}
                onClose={() => setOpenDrawer(false)}
                PaperProps={{ sx: { width: 400, p: 3 } }}
            >
                {selectedTicket && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative'}}>
                        <IconButton
                            onClick={() => setOpenDrawer(false)}
                            size="small"
                            sx={{
                                position: 'absolute',
                                top: -20, // Ajusta a altura para ficar "mais acima"
                                right: -18, // Ajusta para o canto
                                '&:hover': { color: '#fb0b0b' }
                            }}
                        >  
                                <CloseIcon/>
                            </IconButton>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                                Detalhes do Ticket #{selectedTicket.ticket}
                            </Typography>
                         
                        </Stack>
                        <Divider />
                        <Stack spacing={1} sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <IconButton color="primary" onClick={handleCopyTicketData} title="Copiar dados">
                                    <ContentCopyIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="#000000" fontWeight="bold">NOME FANTASIA</Typography>
                                <Typography variant="body1" color='text.secondary' >{capitalizeName(selectedTicket.cliente)}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="#000000" fontWeight="bold">CNPJ</Typography>
                                <Typography variant="body1" color='text.secondary'>{selectedTicket.cnpj}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="#000000" fontWeight="bold">TOTEM</Typography>
                                <Typography variant="body1" color='text.secondary'>
                                    {Array.isArray(selectedTicket.totem) ? selectedTicket.totem.join(', ') : selectedTicket.totem?.replace(/[\[\]"]/g, '')}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="#000000" fontWeight="bold">MOTIVO</Typography>
                                <Typography variant="body1" color='text.secondary'>{selectedTicket.mensagem || 'Não informado'}</Typography>
                            </Box>
                            {tabValue === 1 && (
                                <Box>
                                    <Typography variant="caption" color="#000000" fontWeight="bold">RESUMO</Typography>
                                    <Typography variant="body2" sx={{ mt: 1, p: 1.5, color: 'text.secondary', borderRadius: 1, whiteSpace: 'pre-line' }}>
                                        {selectedTicket.resumo || 'Sem resumo disponível.'}
                                    </Typography>
                                </Box>
                            )}

                        </Stack>
                        {tabValue === 0 && (
                            <Box sx={{ mt: 'auto' }}>
                                <Button variant="contained" fullWidth color="error" onClick={() => handleCloseTicket(selectedTicket.id)} sx={{ textTransform: 'none' }} >
                                    Encerrar Ticket
                                </Button>
                            </Box>
                        )}
                    </Box>
                )}
            </Drawer>
        </React.Fragment>
    )
}