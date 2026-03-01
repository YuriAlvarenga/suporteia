import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchCompanies, createCompany } from '../../../redux/slice/companies/company-slice'
import { fetchTickets } from '../../../redux/slice/ticket-slice/ticket-slice'
import { 
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Typography, Divider, Box, TextField, IconButton, Badge, Skeleton, Avatar
} from '@mui/material'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import GroupsIcon from '@mui/icons-material/Groups'
import FolderSharedIcon from '@mui/icons-material/FolderShared'

const normalizeName = (name) => {
    if (!name) return ''
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "").trim()
}

const capitalizeName = (name) => {
    if (!name) return ''
    return name.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

export default function SideBar() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    
    const { companies, loading } = useSelector((state) => state.companies)
    const { tickets } = useSelector((state) => state.tickets)
    
    const [activePath, setActivePath] = useState(localStorage.getItem('activeMenuItem') || '/board-briefing')
    const [isCreating, setIsCreating] = useState(false)
    const [newGroupName, setNewGroupName] = useState('')

    useEffect(() => {
        dispatch(fetchCompanies())
        dispatch(fetchTickets())
    }, [dispatch])

    const getTicketCount = (companyName) => {
        if (!tickets) return 0
        const targetId = normalizeName(companyName);
        return tickets.filter(t => 
            normalizeName(t.cliente).includes(targetId) && 
            t.status?.toLowerCase().trim() === "em atendimento"
        ).length
    }

    const handleClick = (path) => {
        setActivePath(path)
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

    const renderSkeletons = () => (
        [1, 2, 3, 4, 5].map((item) => (
            <ListItem key={item} sx={{ py: 1 }}>
                <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
                <Skeleton variant="text" width="70%" height={20} />
            </ListItem>
        ))
    )

    return (
        <Drawer variant="permanent" sx={{ width: 200, flexShrink: 0 }}>
            <List sx={{ height: '100vh', width: 200, background: 'var(--color-background)', overflowY: 'auto', pb: 8 }}>
                
                <ListItem sx={{ py: 1.2, px: 3 }}>
                    <ViewInArIcon sx={{ fontSize: '0.9rem', color: 'var(--color-dark)' }} />
                    <Typography sx={{ ml: 2, fontSize: '0.9rem', color: 'var(--color-dark)', fontWeight: 'bold' }}>
                        Support iFood
                    </Typography>
                </ListItem>

                <ListItem sx={{ py: 0.5 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'gray' }}>
                        Dashboards
                    </Typography>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton selected={activePath === '/board-briefing'} onClick={() => handleClick('/board-briefing')}>
                        <ListItemIcon>
                            <FolderSharedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary="Briefing" />
                    </ListItemButton>
                </ListItem>

                <Divider sx={{ my: 1 }} />

                <ListItem sx={{ py: 0.5 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'gray' }}>
                        Chamados
                    </Typography>
                </ListItem>

                {loading && companies.length === 0 ? (
                    renderSkeletons()
                ) : (
                    companies.map((company) => {
                        const companyPath = `/tickets/${normalizeName(company.name)}`
                        const count = getTicketCount(company.name)
                        const isSelected = activePath === companyPath
                        
                        return (
                            <ListItem disablePadding key={company.id}>
                                <ListItemButton selected={isSelected} onClick={() => handleClick(companyPath)}>
                                    
                                    {/* AVATAR ESTILO WHATSAPP */}
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <Avatar
                                            sx={{
                                                width: 32,
                                                height: 32,
                                                fontSize: 14,
                                                bgcolor: '#d9d9d9' ,
                                                color: isSelected ? '#fff' : '#333'
                                            }}
                                        >
                                            {company.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                    </ListItemIcon>

                                    <ListItemText 
                                        primary={capitalizeName(company.name)} 
                                        sx={{ '& span': { fontSize: '0.85rem' } }} 
                                    />

                                    {count > 0 && (
                                        <Badge 
                                            badgeContent={count} 
                                            sx={{ 
                                                '& .MuiBadge-badge': { 
                                                    backgroundColor: '#ffffff',
                                                    color: 'red',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.65rem',
                                                    height: 18,
                                                    minWidth: 18
                                                } 
                                            }} 
                                        />
                                    )}

                                </ListItemButton>
                            </ListItem>
                        )
                    })
                )}

                <Box sx={{ position: 'fixed', bottom: 0, left: 0, width: 200, bgcolor: 'var(--color-background)', borderTop: '1px solid #ddd' }}>
                    {isCreating ? (
                        <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TextField
                                autoFocus
                                size="small"
                                placeholder="Nome..."
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveGroup()}
                                sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem', p: '5px' } }}
                            />
                            <IconButton size="small" onClick={handleSaveGroup} color="success">
                                <CheckIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => setIsCreating(false)} color="error">
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    ) : (
                        <ListItem disablePadding>
                            <ListItemButton onClick={() => setIsCreating(true)}>
                                <ListItemIcon>
                                    <GroupsIcon />
                                </ListItemIcon>
                                <ListItemText primary="Criar Grupo" />
                            </ListItemButton>
                        </ListItem>
                    )}
                </Box>

            </List>
        </Drawer>
    )
}