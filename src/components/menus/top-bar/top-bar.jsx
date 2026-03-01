import React from 'react'
import { AppBar, Grid, Toolbar, Typography } from '@mui/material'
import TopBarLogout from './top-bar-logout'



export default function TopBar() {

    return (
        <React.Fragment>
            <AppBar position="relative" elevation={0} sx={{ background: 'var(--color-highlight)', border: 'none' }} >
                <Toolbar>
                    <Grid container alignItems="center" justifyContent="flex-end" sx={{ fontSize: '0.9rem', width: '100%' }}>
                        <Grid container alignItems="center" spacing={2} sx={{ fontSize: '0.9rem' }}>
                            <TopBarLogout />
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        </React.Fragment>
    )
}
