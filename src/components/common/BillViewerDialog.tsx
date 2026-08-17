import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, IconButton, Typography, Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

interface Props {
  open: boolean;
  url: string;
  title?: string;
  onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;

export const BillViewerDialog = ({ open, url, title = 'View Bill', onClose }: Props) => {
  const isPdf = url.toLowerCase().includes('.pdf');
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (open) setZoom(1);
  }, [open, url]);

  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {!isPdf && (
            <>
              <Tooltip title="Zoom out">
                <span>
                  <IconButton size="small" onClick={zoomOut} disabled={zoom <= MIN_ZOOM}>
                    <ZoomOutIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'center', fontWeight: 600, color: 'text.secondary' }}>
                {Math.round(zoom * 100)}%
              </Typography>
              <Tooltip title="Zoom in">
                <span>
                  <IconButton size="small" onClick={zoomIn} disabled={zoom >= MAX_ZOOM}>
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Reset zoom">
                <span>
                  <IconButton size="small" onClick={() => setZoom(1)} disabled={zoom === 1}>
                    <RestartAltIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          )}
          <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {isPdf ? (
          <iframe
            src={url}
            title={title}
            style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
          />
        ) : (
          <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: zoom > 1 ? 'flex-start' : 'center', justifyContent: zoom > 1 ? 'flex-start' : 'center', bgcolor: '#f0f0f0', p: 1 }}>
            <img
              src={url}
              alt={title}
              style={{
                maxWidth: zoom > 1 ? 'none' : '100%',
                maxHeight: zoom > 1 ? 'none' : '100%',
                width: `${zoom * 100}%`,
                objectFit: 'contain',
                borderRadius: 4,
                margin: 'auto',
                transition: 'width 0.15s ease',
              }}
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
