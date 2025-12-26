import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'

export default function BoardBriefing() {
  return (
    <Box
      sx={{display: 'flex',
        flexWrap: 'wrap',
        '& > :not(style)': {
          m: 1,
          width: '100%',
          height: 400,
        },
      }}
    >
      Briefing
      <Paper elevation={3} />
      Wallets
      <Paper elevation={3} />
    </Box>
  )
}