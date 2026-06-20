import { Box, Grid, Paper, Typography, Skeleton } from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PaymentsIcon from '@mui/icons-material/Payments';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAdminDashboard } from '../hooks/useAdminMaster';

type PaletteColor = 'primary' | 'success' | 'info' | 'error';

interface StatCardProps {
  title: string;
  value: number | undefined;
  icon: React.ReactNode;
  color: PaletteColor;
  loading: boolean;
}

const StatCard = ({ title, value, icon, color, loading }: StatCardProps) => (
  <Paper
    sx={{
      borderRadius: 3,
      p: 2.5,
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'center', sm: 'center' },
      textAlign: { xs: 'center', sm: 'left' },
      gap: 2,
      background: (theme) =>
        `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
      color: 'white',
      boxShadow: (theme) => `0 4px 20px ${theme.palette[color].main}40`,
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-2px)' },
    }}
  >
    <Box
      sx={{
        width: 52,
        height: 52,
        borderRadius: '50%',
        bgcolor: 'rgba(255,255,255,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box>
      {loading ? (
        <>
          <Skeleton variant="text" width={60} height={36} sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: { xs: 'auto', sm: 0 } }} />
          <Skeleton variant="text" width={90} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.2)', mx: { xs: 'auto', sm: 0 } }} />
        </>
      ) : (
        <>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1, color: 'white' }}>
            {value ?? 0}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500, letterSpacing: 0.3, color: 'white' }}>
            {title}
          </Typography>
        </>
      )}
    </Box>
  </Paper>
);

export const AdminDashboard = () => {
  const { data, isLoading } = useAdminDashboard();

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard
          title="Today's Entries"
          value={data?.todayEntries}
          icon={<ReceiptLongIcon sx={{ color: 'white', fontSize: 26 }} />}
          color="primary"
          loading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard
          title="Approved Today"
          value={data?.todayApproved}
          icon={<CheckCircleIcon sx={{ color: 'white', fontSize: 26 }} />}
          color="success"
          loading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard
          title="Settled Today"
          value={data?.todaySettled}
          icon={<PaymentsIcon sx={{ color: 'white', fontSize: 26 }} />}
          color="info"
          loading={isLoading}
        />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard
          title="Rejected Today"
          value={data?.todayRejected}
          icon={<CancelIcon sx={{ color: 'white', fontSize: 26 }} />}
          color="error"
          loading={isLoading}
        />
      </Grid>
    </Grid>
  );
};
