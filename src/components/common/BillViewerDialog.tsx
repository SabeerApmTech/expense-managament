import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, IconButton, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface Props {
  open: boolean;
  url: string;
  title?: string;
  onClose: () => void;
}

export const BillViewerDialog = ({ open, url, title = 'View Bill', onClose }: Props) => {
  const isPdf = url.toLowerCase().includes('.pdf');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, height: '90vh' } } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>{title}</Typography>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {isPdf ? (
          <iframe
            src={url}
            title={title}
            style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
          />
        ) : (
          <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f0f0', p: 1 }}>
            <img
              src={url}
              alt={title}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 4 }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
        <Button
          href={url}
          target="_blank"
          rel="noreferrer"
          endIcon={<OpenInNewIcon fontSize="small" />}
          variant="text"
        >
          Open in new tab
        </Button>
      </DialogActions>
    </Dialog>
  );
};
