import React from 'react'
import { Box, Stack, Typography, Divider } from '@mui/material'

export default function BoardRankingsSection({ groupRanking, userRanking }) {
    return (
        <Box sx={{ p: 2, bgcolor: 'white' }}>
            <Stack
                direction="row"
                spacing={0}
                divider={<Divider orientation="vertical" flexItem />}
            >
                {/* Ranking de Grupos */}
                <Box sx={{ flex: 1, pr: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666', mb: 2, display: 'block' }}>
                        Ranking de Grupos
                    </Typography>
                    <Stack spacing={1}>
                        {groupRanking.map((item, idx) => (
                            <Stack key={idx} direction="row" justifyContent="space-between" alignItems="center" sx={{ pb: 0.5, borderBottom: '1px solid #f9f9f9' }}>
                                <Typography sx={{ fontSize: '0.7rem', color: '#444', fontWeight: '500', textTransform: 'capitalize' }}>
                                    {item.name.toLowerCase()}
                                </Typography>
                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--color-highlight)' }}>
                                    {item.count} <Box component="span" sx={{ fontSize: '0.65rem', color: 'gray', fontWeight: 'normal' }}>({item.percent}%)</Box>
                                </Typography>
                            </Stack>
                        ))}
                        {groupRanking.length === 0 && (
                            <Typography sx={{ fontSize: '0.65rem', color: 'gray', py: 1 }}>
                                Nenhum registro encontrado.
                            </Typography>
                        )}
                    </Stack>
                </Box>

                {/* Ranking de Usuários */}
                <Box sx={{ flex: 1, pl: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#666', mb: 2, display: 'block' }}>
                        Tickets por Usuários
                    </Typography>
                    <Box sx={{
                        columnCount: userRanking.length > 5 ? 2 : 1,
                        columnGap: 2,
                        '& > div': { breakInside: 'avoid', mb: 1 }
                    }}>
                        {userRanking.map((item, idx) => (
                            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.5, borderBottom: '1px solid #f9f9f9' }}>
                                <Typography noWrap sx={{ fontSize: '0.65rem', color: '#444', fontWeight: '500', maxWidth: '65%' }}>
                                    {item.name}
                                </Typography>
                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 'bold', color: item.count > 0 ? 'var(--color-highlight)' : '#ddd' }}>
                                    {item.count} <Box component="span" sx={{ fontSize: '0.6rem', color: 'gray', fontWeight: 'normal' }}>({item.percent}%)</Box>
                                </Typography>
                            </Box>
                        ))}
                        {userRanking.length === 0 && (
                            <Typography sx={{ fontSize: '0.65rem', color: 'gray', py: 1 }}>
                                Nenhum registro encontrado.
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Stack>
        </Box>
    )
}