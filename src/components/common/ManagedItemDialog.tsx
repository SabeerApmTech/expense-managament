import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box,
} from '@mui/material';

interface Props {
  open: boolean;
  onClose: () => void;
  asPanel?: boolean;
  title: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  extras?: React.ReactNode;
  dividers?: boolean;
}

export const ManagedItemDialog = ({
  open,
  onClose,
  asPanel = false,
  title,
  maxWidth = 'sm',
  children,
  extras,
  dividers = true,
}: Props) => {
  if (asPanel) {
    return (
      <>
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {children}
        </Box>
        {extras}
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
        <DialogContent dividers={dividers} sx={{ p: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {children}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>
      {extras}
    </>
  );
};
