import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  title?: string;
  message?: React.ReactNode;
}

export const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  isDeleting,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this item? This cannot be undone.',
}: Props) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
    slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
    <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
    <DialogContent>
      <Typography>{message}</Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} disabled={isDeleting}>Cancel</Button>
      <Button variant="contained" color="error" onClick={onConfirm} disabled={isDeleting}
        startIcon={isDeleting ? <CircularProgress size={14} color="inherit" /> : <DeleteIcon />}>
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);
