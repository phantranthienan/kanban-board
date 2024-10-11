import React from 'react'
import { Box, CircularProgress } from '@mui/material'

interface LoadingProps {
  fullHeight?: boolean
}

const Loading: React.FC<LoadingProps> = ({ fullHeight }) => {
  return (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: fullHeight ? '100vh' : '100%',
        }}
    >
        <CircularProgress />
    </Box>
  )
}

export default Loading