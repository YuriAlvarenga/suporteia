import * as React from 'react'
import { AppBar, Tabs, Tab, Box } from '@mui/material'

export default function TopBarTicket() {
    const [value, setValue] = React.useState(0)

    const handleChange = (_, newValue) => {
        setValue(newValue)
    }

    return (
        <Box>
            <AppBar position="static" color="default" elevation={0} sx={{ minHeight: 30 }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    sx={{ minHeight: 30, '& .MuiTabs-indicator': { backgroundColor: 'var(--color-highlight)', } }}>
                    <Tab label="Tickets Abertos (3)"
                        sx={{
                            minHeight: 35, py: 0, fontSize: '0.75rem', '&.Mui-selected': {
                                color: 'var(--color-highlight)',
                            },
                        }}
                    />
                    <Tab label="Tickets em Andamento (7)"
                        sx={{
                            minHeight: 35, py: 0, fontSize: '0.75rem', '&.Mui-selected': {
                                color: 'var(--color-highlight)',
                            },
                        }}
                    />
                    <Tab label="Tickets Encerrados (97)"
                        sx={{
                            minHeight: 35, py: 0, fontSize: '0.75rem', '&.Mui-selected': {
                                color: 'var(--color-highlight)',
                            },
                        }}
                    />
                </Tabs>
            </AppBar>
        </Box>
    )
}
