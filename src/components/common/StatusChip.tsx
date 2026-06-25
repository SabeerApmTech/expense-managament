import { Chip } from '@mui/material';
import { STATUS_COLORS, resolveStatusLabel } from '../../constants/masterData';

interface Props {
  status: string | number;
}

export const StatusChip = ({ status }: Props) => {
  const label = resolveStatusLabel(status);
  return (
    <Chip
      label={label}
      color={STATUS_COLORS[label] || 'default'}
      size="small"
      sx={{ fontWeight: 600 }}
    />
  );
};
