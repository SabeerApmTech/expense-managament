import { Box, Button } from '@mui/material';
import { FieldLabel } from './Field';

interface Props {
  billUrl: string;
  onView: (url: string) => void;
  label?: string;
}

export const BillAttachments = ({ billUrl, onView, label }: Props) => {
  const urls = billUrl.split(',').map(u => u.trim()).filter(Boolean);

  return (
    <Box>
      {label && <FieldLabel>{label}</FieldLabel>}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: label ? 0.5 : 0 }}>
        {urls.map((url, i) => (
          <Button key={i} variant="outlined" size="small" onClick={() => onView(url)}>
            View Bill{urls.length > 1 ? ` ${i + 1}` : ''}
          </Button>
        ))}
      </Box>
    </Box>
  );
};
