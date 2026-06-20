import { Box, Typography, Button } from '@mui/material';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState = ({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: Props) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 2 }}>
    <ReportProblemOutlinedIcon sx={{ fontSize: 56, color: 'error.main' }} />
    <Typography color="text.secondary">{message}</Typography>
    {onRetry && (
      <Button variant="outlined" color="error" onClick={onRetry}>
        Retry
      </Button>
    )}
  </Box>
);
