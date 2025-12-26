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

        // 1. Definição das Variáveis CSS Nativas no :root
        MuiCssBaseline: {
            styleOverrides: {
                // Estas variáveis CSS podem ser acessadas em qualquer lugar com var(--nome-da-variavel)
                ':root': {
                    '--color-highlight': 'rgba(255, 5, 5, 0.96)', // vermelho (Destaque)
                    '--color-background': '#ffffffff', // Fundo Preto (Sidebar/TopBar)
                    '--color-text-inactive': 'rgba(18, 18, 18, 0.43)', // Cinza (Texto Inativo)
                    '--color-white': 'rgba(255, 255, 255, 1)', // Branco Puro 
                    '--color-dark': '#000000', // Preto Puro 
                    '--linear-gradient-principal': 'linear-gradient(to right, rgba(255, 5, 5, 0.5) 20%, rgba(79, 75, 75, 0.5) 100%)' // linear gradiente principal do sistema
                },
                
                '@keyframes slide-text': {
                    '0%': { transform: 'translateX(100%)' },  // Começa fora da tela (direita)
                    '100%': { transform: 'translateX(-100%)' }, // Termina fora da tela (esquerda)
                },

            },
        },

        // 2. Sobrescritas de Estilo Comuns
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    // O 'inherit' fará com que o ícone pegue a cor definida no ListItemButton/ListItem
                    color: 'inherit',
                    minWidth: 'auto',
                    marginRight: theme.spacing(2)
                },
            },
        },

        // Exemplo: Estilo para o Drawer (Sidebar)
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: 'var(--color-background-dark)',
                    // Garante que o texto dentro do Drawer herde o branco por padrão
                    color: 'var(--color-white)',
                }
            }
        },

        // Ajuste no padding do Toolbar para AppBar
        MuiToolbar: {
            styleOverrides: {
                root: {
                    // Altura da barra superior
                    minHeight: theme.mixins.toolbar.minHeight,
                    // Garante que o padding lateral seja ajustado para TopBar
                    paddingLeft: theme.spacing(3),
                    paddingRight: theme.spacing(3),
                }
            }
        }
    },
}

export default theme