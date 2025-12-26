import React, { useState, useEffect } from 'react'
import { FaRegIdCard } from "react-icons/fa"
import FolderSharedIcon from '@mui/icons-material/FolderShared'
import GroupsIcon from '@mui/icons-material/Groups'



// ícones e nomes que estão no menu lateral
export const getCategories = () => {

    return [

        {
            name: 'Dashboard',
            role: ['Admin'],
            children: [
                { id: 101, name: 'Overviwer', icon: <FolderSharedIcon style={{ fontSize: '1rem' }} />, path: '/board-briefing' },
            ],
        },

        {
            name: 'Chamados',
            role: ['Admin'],
            children: [
                { id: 202, name: 'Bobs', icon: <FaRegIdCard style={{ fontSize: '1rem', }} />,  path: '/tickets'  },
                { id: 203, name: 'Giraffas', icon: <GroupsIcon style={{ fontSize: '1rem' }} />,  path: '/tickets' },
                { id: 204, name: 'Trigo', icon: <FaRegIdCard style={{ fontSize: '1rem', }} />,  path: '/tickets'  },
                { id: 205, name: 'Mania de Churrasco', icon: <GroupsIcon style={{ fontSize: '1rem' }} />,  path: '/tickets' },
                { id: 206, name: 'American Burger', icon: <FaRegIdCard style={{ fontSize: '1rem', }} />,  path: '/tickets' },
                { id: 207, name: 'Juicestreet', icon: <GroupsIcon style={{ fontSize: '1rem' }} />,  path: '/tickets' },
            ]
        },

        {
            name: 'Manutenção de Contas',
            role: ['Admin'],
            children: [
                { id: 301, name: 'Relatórios', icon: <FolderSharedIcon style={{ fontSize: '1rem' }} />,  path: '/' },
                { id: 302, name: 'Material de Apoio', icon: <FolderSharedIcon style={{ fontSize: '1rem' }} />,  path: '/' },
            ],
        },
    ]
}