import React from 'react'
import { Box, Stack, Typography, LinearProgress, Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { format, parseISO } from 'date-fns'

export default function BoardTagsSection({ classificationData, isFiltered, selectedMetric }) {
    return (
        <Box sx={{ p: 2, pt: 0 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666', mb: 2, display: 'block' }}>
                Classificação por Tag {selectedMetric === 'indevido' ? '(Apenas Indevidos)' : ''}
            </Typography>
            <Stack spacing={2}>
                {classificationData.map((tag) => (
                    <Box
                        key={tag.name}
                        sx={{
                            p: 1.5,
                            border: '1px solid #f0f0f0',
                            borderRadius: 2,
                            '&:hover': { borderColor: '#ccc' }
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Box>
                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#444', textTransform: 'uppercase' }}>
                                    {tag.name}
                                </Typography>
                                <Typography sx={{ fontSize: '0.6rem', color: 'gray' }}>
                                    {!isFiltered 
                                        ? '100% das ocorrências' 
                                        : `${tag.percent.toFixed(1)}% das ${tag.globalCount} ocorrências do período`}
                                </Typography>
                            </Box>
                            <Typography sx={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 'bold', 
                                color: 'var(--color-highlight)' 
                            }}>
                                {tag.count}
                            </Typography>
                        </Stack>

                        <LinearProgress
                            variant="determinate"
                            value={tag.percent}
                            sx={{
                                height: 4,
                                borderRadius: 2,
                                mb: 1,
                                bgcolor: '#f0f0f0',
                                '& .MuiLinearProgress-bar': { 
                                    bgcolor: 'var(--color-highlight)', 
                                    borderRadius: 2 
                                }
                            }}
                        />

                        <Accordion elevation={0} sx={{ '&:before': { display: 'none' }, bgcolor: '#fafafa' }}>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon sx={{ fontSize: '1rem' }} />}
                                sx={{ minHeight: 32, height: 32, '& .MuiAccordionSummary-content': { my: 0.5 } }}
                            >
                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 700 }}>Ver Tickets Relacionados</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ p: 1 }}>
                                <Box sx={{ bgcolor: '#fcfcfc', borderRadius: '4px' }}>
                                    {tag.listaTickets.map((t, idx) => (
                                        <Box key={idx} sx={{ py: 0.5, px: 1, borderBottom: '1px solid #eee', '&:last-child': { borderBottom: 0 }}}>
                                            <Typography sx={{ fontSize: '0.65rem', color: '#666' }}>
                                                {format(parseISO(t.data_abertura), 'dd/MM/yyyy HH:mm')} - ID: {t.id} 
                                                <Box component="span" sx={{ mx: 1, color: '#ccc' }}>|</Box>
                                                <Box component="span" sx={{ textTransform: 'capitalize' }}>
                                                    {t.cliente}
                                                </Box>
                                            </Typography>
                                        </Box>
                                    ))}
                                    
                                    {tag.listaTickets.length === 0 && (
                                        <Typography sx={{ fontSize: '0.65rem', color: 'gray', py: 1, px: 1 }}>
                                            Nenhum ticket encontrado.
                                        </Typography>
                                    )}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                ))}
            </Stack>
        </Box>
    )
}