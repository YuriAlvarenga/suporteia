import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCompanies, createCompany } from '../../../redux/slice/companies/company-slice'
import { fetchTickets } from '../../../redux/slice/ticket-slice/ticket-slice'
import {
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, Box, TextField, IconButton, Badge, Skeleton, Avatar
} from '@mui/material'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import GroupsIcon from '@mui/icons-material/Groups'
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import BarChartIcon from '@mui/icons-material/BarChart'

const DRAWER_WIDTH = 200

const capitalizeName = (name) => {
    if (!name) return ''
    return name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

export default function SideBar() {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    const { companies, loading } = useSelector((state) => state.companies)
    const { tickets } = useSelector((state) => state.tickets)

    const [isCreating, setIsCreating] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')

    useEffect(() => {
        dispatch(fetchCompanies())
        dispatch(fetchTickets())
    }, [dispatch])

    // Filtro por ID direto para o contador
    const getTicketCount = (companyId) => {
        if (!tickets) return 0
        return tickets.filter(t =>
            t.company_id === companyId &&
            t.status?.toLowerCase().trim() === "em atendimento"
        ).length
    }

    const handleClick = (path) => {
        localStorage.setItem('activeMenuItem', path)
        navigate(path)
    }

    const handleSaveGroup = async () => {
        if (!newGroupName.trim()) {
            setIsCreating(false)
            return
        }
        await dispatch(createCompany(capitalizeName(newGroupName)))
        setNewGroupName('')
        setIsCreating(false)
    }

    return (
        <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}>
            <List sx={{ 
                height: '100vh', 
                background: 'var(--color-background)', 
                overflowY: 'auto', 
                pb: 8,
                scrollbarWidth: 'none',
                '&::-webkit-scrollbar': { display: 'none' },
                '-ms-overflow-style': 'none'
            }}>
                <ListItem sx={{ py: 1.2, px: 3 }}>
                    <ViewInArIcon sx={{ fontSize: '0.9rem', color: 'var(--color-dark)' }} />
                    <Typography onClick={() => handleClick('/')} sx={{ ml: 2, fontSize: '0.9rem', color: 'var(--color-dark)', fontWeight: 'bold', cursor: 'pointer' }}>
                        Support iFood
                    </Typography>
                </ListItem>

                <ListItem sx={{ py: 0.5 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'gray' }}> Dashboards </Typography>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton selected={location.pathname === '/'} onClick={() => handleClick('/')} >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            <Box sx={{width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#d9d9d9' }}>
                                <BarChartIcon sx={{ fontSize: 14, color: location.pathname === '/' ? '#7b1616' : '#333' }} />
                            </Box>
                        </ListItemIcon>
                        <ListItemText primary="Overviewer" />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton selected={location.pathname === '/board-briefing'} onClick={() => handleClick('/board-briefing')} >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                            <Box sx={{width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#d9d9d9' }}>
                                <PendingActionsIcon sx={{ fontSize: 14, color: location.pathname === '/board-briefing' ? '#7b1616' : '#333' }} />
                            </Box>
                        </ListItemIcon>
                        <ListItemText primary="Briefing" />
                    </ListItemButton>
                </ListItem>

                <Divider sx={{ my: 1 }} />

                <ListItem sx={{ py: 0.5 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'gray' }}> Chamados </Typography>
                </ListItem>

                {loading && companies.length === 0 ? (
                   [1,2,3,4,5].map(i => <Skeleton key={i} variant="text" sx={{ mx: 2 }} />)
                ) : (
                    // Criamos uma cópia do array e ordenamos: quem tem chamados (count > 0) fica no topo
                    [...companies]
                        .sort((a, b) => getTicketCount(b.id) - getTicketCount(a.id))
                        .map((company) => {
                            const companyPath = `/tickets/${company.id}`
                            const count = getTicketCount(company.id)
                            const isSelected = location.pathname === companyPath
                            return (
                                <ListItem disablePadding key={company.id}>
                                    <ListItemButton selected={isSelected} onClick={() => handleClick(companyPath)}>
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            <Avatar sx={{ width: 28, height: 28, fontSize: 14, bgcolor: '#d9d9d9', color: isSelected ? '#7b1616' : '#333'}}>
                                                {company.name.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={capitalizeName(company.name)} 
                                            sx={{'& .MuiListItemText-primary': {fontSize: '12px'}}}
                                        />
                                        {count > 0 && (
                                            <Badge 
                                                badgeContent={count} 
                                                sx={{ '& .MuiBadge-badge': { bgcolor: '#fff', color: '#7b1616', fontWeight: 'bold' } }} 
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>
                            )
                        })
                )}

            </List>
        </Drawer>
    )
}