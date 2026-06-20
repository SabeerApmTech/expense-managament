import { Box, CircularProgress, Typography } from '@mui/material';

interface Props {
  message?: string;
}

export const LoadingState = ({ message = 'Loading...' }: Props) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 2 }}>
    <CircularProgress />
    <Typography color="text.secondary">{message}</Typography>
  </Box>
);
