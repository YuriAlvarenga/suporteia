import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton, Skeleton } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'

export default function TicketTable({ 
    loading, 
    tickets, 
    filteredTickets, 
    tabValue, 
    onViewDetails, 
    capitalizeName 
}) {
    return (
        <Paper elevation={3} sx={{ padding: 2 }}>
            <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead sx={{ '& .MuiTableCell-root': { border: '1px solid rgba(255,255,255,0.3)' } }}>
                    <TableRow sx={{ background: 'var(--color-highlight)' }}>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Data</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Ticket</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Loja</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>CNPJ</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Totem</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Início</TableCell>
                        {tabValue === 1 && <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Tempo</TableCell>}
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Ações</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading && tickets.length === 0 ? (
                        [1, 2, 3, 4, 5].map((item) => (
                            <TableRow key={item}>
                                {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                                    <TableCell key={col}><Skeleton variant="text" height={25} /></TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        filteredTickets.map((ticket, index) => {
                            const dataAbertura = ticket.data_abertura.includes('T') ? ticket.data_abertura : ticket.data_abertura.replace(' ', 'T');
                            const dataObj = new Date(dataAbertura);
                            return (
                                <TableRow key={ticket.id} hover sx={{ bgcolor: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                                    <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{dataObj.toLocaleDateString('pt-BR')}</TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{ticket.ticket}</TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{capitalizeName(ticket.cliente)}</TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{ticket.cnpj}</TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{Array.isArray(ticket.totem) ? ticket.totem.join(', ') : ticket.totem?.replace(/[\[\]"]/g, '')}</TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                                    {tabValue === 1 && <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{ticket.tempo}</TableCell>}
                                    <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                                        <IconButton sx={{ color: "#1976d2" }} onClick={() => onViewDetails(ticket)}><VisibilityIcon fontSize="small" /></IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </Paper>
    )
}