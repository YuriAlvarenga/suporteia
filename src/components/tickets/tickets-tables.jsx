import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton, Skeleton, Stack } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AssignmentIcon from '@mui/icons-material/Assignment'
import LinkIcon from '@mui/icons-material/Link'
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant'

export default function TicketTable({ loading, tickets, filteredTickets, alerts = [], tabValue, onViewDetails, capitalizeName }) {
    return (
        <Paper elevation={3} sx={{ padding: 2 }}>
            <Table size="small" sx={{ tableLayout: 'fixed', width: '100%' }}>
                <TableHead sx={{ '& .MuiTableCell-root': { border: '1px solid rgba(255,255,255,0.3)' } }}>
                    <TableRow sx={{ background: 'var(--color-highlight)' }}>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Data Abertura</TableCell>

                        {tabValue === 1 && (
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Data Fechamento</TableCell>
                        )}
                        {tabValue === 0 && (
                            <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Ticket</TableCell>
                        )}
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Loja</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>CNPJ</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Totem</TableCell>

                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Tempo Inicial</TableCell>

                        {tabValue === 1 && (
                            <>
                                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Tempo Final</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Tempo Total</TableCell>
                            </>
                        )}

                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Contém</TableCell>

                        <TableCell sx={{ fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', color: '#FFF', padding: '8px' }}>Ações</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading && tickets.length === 0 ? (
                        [1, 2, 3, 4, 5].map((item) => (
                            <TableRow key={item}>
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((col) => (
                                    <TableCell key={col}><Skeleton variant="text" height={25} /></TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        filteredTickets.map((ticket, index) => {
                            const formatarData = (dataStr) => {
                                if (!dataStr) return null
                                const isoStr = dataStr.includes('T') ? dataStr : dataStr.replace(' ', 'T')
                                return new Date(isoStr)
                            }

                            const dataAberturaObj = formatarData(ticket.data_abertura)
                            const dataFechamentoObj = formatarData(ticket.data_fechamento)

                            // Lógica de verificação de alerta
                            const temAlerta = alerts.some(alerta => 
                                String(alerta.group_id) === String(ticket.company_id) && 
                                alerta.store_name === ticket.cliente
                            )

                            return (
                                <TableRow key={ticket.id} hover sx={{ bgcolor: index % 2 === 0 ? '#f9f9f9' : '#fff' }}>
                                    <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                                        {dataAberturaObj ? dataAberturaObj.toLocaleDateString('pt-BR') : '-'}
                                    </TableCell>

                                    {tabValue === 1 && (
                                        <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center', fontWeight: '500' }}>
                                            {dataFechamentoObj ? dataFechamentoObj.toLocaleDateString('pt-BR') : '-'}
                                        </TableCell>
                                    )}

                                    {tabValue === 0 && (
                                        <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center', wordBreak: 'break-all' }}>
                                            {ticket.ticket}
                                        </TableCell>
                                    )}
                                    <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                                        {capitalizeName(ticket.cliente)}
                                    </TableCell>

                                    <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center', wordBreak: 'break-all' }}>
                                        {ticket.cnpj}
                                    </TableCell>

                                    <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                                        {Array.isArray(ticket.totem) ? ticket.totem.join(', ') : ticket.totem?.replace(/[\[\]"]/g, '')}
                                    </TableCell>

                                    <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                                        {dataAberturaObj ? dataAberturaObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                    </TableCell>

                                    {tabValue === 1 && (
                                        <>
                                            <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                                                {dataFechamentoObj ? dataFechamentoObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </TableCell>
                                            <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                                                {ticket.tempo}
                                            </TableCell>
                                        </>
                                    )}

                                    <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                                        <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                            {temAlerta && (
                                                <NotificationImportantIcon fontSize="small" sx={{ color: 'var(--color-highlight)' }} titleAccess="Alerta Ativo" />
                                            )}
                                            
                                            {ticket.observacoes && String(ticket.observacoes).trim().length > 0 && (
                                                <AssignmentIcon fontSize="small" sx={{ color: 'var(--color-highlight)' }} titleAccess="Possui observação" />
                                            )}

                                            {ticket.link && String(ticket.link).trim().length > 0 && (
                                                <IconButton sx={{ color: "#1976d2", '&:hover': { color: 'var(--color-highlight)' } }} size="small"
                                                    onClick={() => {
                                                        const url = ticket.link.startsWith('http') ? ticket.link : `https://${ticket.link}`
                                                        window.open(url, '_blank')
                                                    }}
                                                    title="Abrir thread associada"
                                                >
                                                    <LinkIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                        </Stack>
                                    </TableCell>

                                    <TableCell sx={{ fontSize: '0.8rem', border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>
                                            <IconButton sx={{ color: "#1976d2", '&:hover': { color: 'var(--color-highlight)' } }} onClick={() => onViewDetails(ticket)} title="Visualizar Detalhes" >
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
    )
}