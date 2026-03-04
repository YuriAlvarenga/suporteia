import { createTheme } from '@mui/material/styles'

let theme = createTheme({
  // Configurações Globais 
  mixins: {
    toolbar: {
      minHeight: 44,
    },
  },
})

// Extensão do tema para incluir variáveis CSS e componentes
theme = {
  ...theme,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--color-highlight': '#7b1616',        // Vermelho Destaque
          '--color-background': '#ffffffff',                     // Fundo Sidebar/TopBar
          '--color-text-inactive': 'rgba(18, 18, 18, 0.43)',   // Texto Inativo
          '--color-white': 'rgba(255, 255, 255, 1)',           // Branco Puro
          '--color-dark': '#000000',                            // Preto Puro
        },
      },
    },

    // Sidebar e Drawer
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: 'var(--color-background)',
          color: 'var(--color-white)',
        },
      },
    },

    // ListItemButton (todos os itens do menu)
    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: 'var(--color-text-inactive)',
          transition: 'background-color 0.2s ease, color 0.2s ease',

          '& .MuiListItemIcon-root': {
            color: 'inherit', // ícone herda a cor
            minWidth: 'auto',
            marginRight: theme.spacing(2),
          },

          '&.Mui-selected': {
            backgroundColor: 'var(--color-highlight)',
            color: 'var(--color-white)',
            '&:hover': {
              backgroundColor: '#7b1616',
            },
          },

          '&:hover': {
            backgroundColor: '#7b1616',
            color: 'var(--color-white)',
          },
        },
      },
    },

    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: 'inherit', // texto herda a cor do ListItemButton
          fontSize:'0.9rem'
        },
      },
    },

    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: theme.mixins.toolbar.minHeight,
          paddingLeft: theme.spacing(3),
          paddingRight: theme.spacing(3),
        },
      },
    },
  },
}

export default theme
