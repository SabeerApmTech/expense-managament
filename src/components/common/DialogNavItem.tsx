import { Box, Typography } from '@mui/material';

interface Props {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  isMobile: boolean;
  onClick: () => void;
}

export const DialogNavItem = ({ label, icon, active, isMobile, onClick }: Props) => (
  <Box
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      cursor: 'pointer',
      transition: 'all 0.15s',
      whiteSpace: 'nowrap',
      ...(isMobile ? {
        px: 2,
        py: 1.25,
        borderBottom: '3px solid',
        borderColor: active ? 'primary.main' : 'transparent',
        color: active ? 'primary.main' : 'text.secondary',
        '&:hover': { color: 'primary.main', bgcolor: 'action.hover' },
      } : {
        px: 2,
        py: 1,
        borderLeft: '3px solid',
        borderColor: active ? 'primary.main' : 'transparent',
        bgcolor: active ? 'primary.50' : 'transparent',
        color: active ? 'primary.main' : 'text.primary',
        '&:hover': { bgcolor: active ? 'primary.50' : 'action.hover' },
      }),
    }}
  >
    <Box sx={{ display: 'flex', color: active ? 'primary.main' : 'text.secondary', flexShrink: 0 }}>
      {icon}
    </Box>
    <Typography variant="body2" sx={{ fontWeight: active ? 600 : 400, fontSize: 13 }}>
      {label}
    </Typography>
  </Box>
);
