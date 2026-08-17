import { Box, Typography, Paper } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

export const UnderConstruction = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      p: 2,
    }}
  >
    <Paper
      sx={{
        maxWidth: 480,
        width: '100%',
        p: { xs: 3, sm: 5 },
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <ConstructionIcon sx={{ fontSize: 72, color: 'warning.main' }} />
      <Typography variant="h5" fontWeight={700}>
        Under Construction
      </Typography>
      <Typography variant="body1" color="text.secondary">
        We're upgrading our systems to serve you better. This app is
        temporarily unavailable while we roll out these changes.
      </Typography>
      <Typography variant="body2" color="text.disabled">
        Please check back soon. Thank you for your patience.
      </Typography>
    </Paper>
  </Box>
);
