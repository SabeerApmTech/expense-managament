import { Box, Typography } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';

interface Props {
  title?: string;
  description?: string;
}

export const EmptyState = ({
  title = 'No records found',
  description = 'There are no items to display.',
}: Props) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 1 }}>
    <InboxIcon sx={{ fontSize: 56, color: 'text.disabled' }} />
    <Typography variant="h6" color="text.secondary">{title}</Typography>
    <Typography variant="body2" color="text.disabled">{description}</Typography>
  </Box>
);
