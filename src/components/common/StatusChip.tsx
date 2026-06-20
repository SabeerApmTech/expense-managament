import { Chip } from '@mui/material';
import { STATUS_COLORS } from '../../constants/masterData';

interface Props {
  status: string;
}

export const StatusChip = ({ status }: Props) => (
  <Chip
    label={status}
    color={STATUS_COLORS[status] || 'default'}
    size="small"
    sx={{ fontWeight: 600 }}
  />
);
