import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Divider, Drawer, List, Box, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import { getCategories } from './utils-side-bar/categories-side-bar'
import { filterCategories } from './utils-side-bar/filter-categories'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'



export default function SideBar({ handleClick, onItemSelect }) { //herdando de página home

    const navigate = useNavigate()
    const defaultActiveItem = 101
    const [activeItem, setActiveItem] = useState(Number(localStorage.getItem('activeMenuItem')) || defaultActiveItem)
    const { role } = useSelector((state) => state.auth)


    const handleCategoryItemClick = (childName, id, path) => {
        setActiveItem(id)
        localStorage.setItem('activeMenuItem', id)
        navigate(path)
        if (onItemSelect) {
            onItemSelect(childName) // notifica o pai qual item foi selecionado
        }
    }

    const categories = getCategories()

    const filteredCategories = filterCategories(categories, role)

    return (
        <Drawer variant="permanent" sx={{ background: 'var(--color-background)' }}>
            <List disablePadding sx={{ background: 'var(--color-background)', height: '100vh', width: 200 }}>
                <ListItem sx={{ py: 1.2, px: 3, boxShadow: '0 -1px 0 rgb(255,255,255,0.1) inset', fontSize: '1rem', color: 'var(--color-dark)' }}>
                    <ViewInArIcon />
                    <Typography variant="body3" sx={{ ml: 2, fontSize: '0.9rem' }}>
                        Support iFood
                    </Typography>
                </ListItem>

                {filteredCategories.map(({ name, children }, index) => (
                    <Box key={`category-${name}-${index}`} sx={{ background: 'var(--color-background)' }}>
                        <ListItem sx={{ p: 1, pb: 0 }}>
                            <ListItemText sx={{ mb: 0 }} primary={<Typography sx={{ fontSize: '0.9rem', color: 'var(--color-dark)' }}>{name}</Typography>} />
                        </ListItem>
                        {children.map(({ id, name: childName, icon, path }, childIndex) => (
                            <ListItem disablePadding key={`child-${id}-${childIndex}`}
                                sx={{
                                    borderRight: activeItem === id
                                        ? "6px solid var(--color-highlight)"
                                        : 'none'
                                }}
                            >
                                <ListItemButton selected={activeItem === id} onClick={() => handleCategoryItemClick(childName, id, path)} sx={{
                                    '&.Mui-selected': {
                                        backgroundColor: 'rgba(247, 18, 18, 0.69)',
                                        '&:hover': {
                                            backgroundColor: 'var(--color-highlight)',
                                        },
                                    },

                                    color: activeItem === id
                                        ? 'var(--color-white)'
                                        : 'var(--color-text-inactive)',

                                    '&:hover': {
                                        color: 'var(--color-white)',
                                        backgroundColor: 'var(--color-highlight)',
                                    },
                                }}>
                                    <ListItemIcon sx={{ color: 'inherit' }}>{icon}</ListItemIcon>
                                    <ListItemText>
                                        <Typography sx={{ color: 'inherit', fontSize: '0.8rem' }}>
                                            {childName}
                                        </Typography>
                                    </ListItemText>
                                </ListItemButton>
                            </ListItem>
                        ))}
                        <Divider sx={{ mt: 2 }} />
                    </Box>
                ))}

                {/* 3. Botão Fixo no Rodapé */}
                <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: '1px solid var(--color-text-inactive)', width: '200px' }}>
                    <ListItem disablePadding sx={{
                        color: 'var(--color-text-inactive)',
                        '&:hover': {
                            background: 'var(--color-highlight)',
                            color: 'rgba(255, 255, 255, 0.8)',
                        }
                    }}>
                        <ListItemButton onClick={handleClick} >
                            <ListItemIcon sx={{ minWidth: 35 }}>
                                <AddCircleOutlineIcon />
                            </ListItemIcon>
                            <ListItemText primary={
                                <Typography sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                    Criar Chamado
                                </Typography>
                            } />
                        </ListItemButton>
                    </ListItem>
                </Box>

            </List>
        </Drawer>
    )
}