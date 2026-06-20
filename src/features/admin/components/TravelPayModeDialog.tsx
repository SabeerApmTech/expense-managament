import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  RadioGroup, FormControlLabel, Radio, TextField, Box, Typography,
  CircularProgress, Stack, IconButton, Divider,
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import PaymentIcon from '@mui/icons-material/Payment';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { useTravelModes, usePayModes } from '../../expenses/hooks/useMasterData';
import { useSaveTravelPayMode, useDeleteTravelPayMode } from '../hooks/useAdminMaster';
import { useAuthContext } from '../../../store/authStore';

interface Props { open: boolean; onClose: () => void; }

export const TravelPayModeDialog = ({ open, onClose }: Props) => {
  const [isTravelMode, setIsTravelMode] = useState(true);
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const { user } = useAuthContext();
  const { data: travelModes = [] } = useTravelModes();
  const { data: payModes = [] } = usePayModes();
  const { mutate: save, isPending: saving } = useSaveTravelPayMode();
  const { mutate: remove, isPending: deleting } = useDeleteTravelPayMode();

  const resetForm = () => { setName(''); setNameError(''); setEditingId(null); };

  const handleEdit = (id: number, modeName: string, travel: boolean) => {
    setEditingId(id);
    setIsTravelMode(travel);
    setName(modeName);
    setNameError('');
  };

  const handleSave = () => {
    if (!name.trim()) { setNameError('Name is required'); return; }
    const now = new Date().toISOString();
    save({
      travelorPaymentMode: {
        id: editingId ?? 0,
        name: name.trim(),
        isTravelMode,
        createdBy: user?.id ?? '',
        createdDate: now,
        updatedBy: user?.id ?? '',
        updatedDate: now,
      },
    }, { onSuccess: resetForm });
  };

  const ModeList = ({ modes, travel }: { modes: { id: number; name: string }[]; travel: boolean }) => (
    <Stack spacing={0.5}>
      {modes.length === 0
        ? <Typography variant="caption" color="text.secondary">None added yet</Typography>
        : modes.map((m) => (
          <Box key={m.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 0.25 }}>
            <Typography variant="body2" sx={{ flex: 1, fontSize: 13 }}>{m.name}</Typography>
            <IconButton
              size="small"
              onClick={() => handleEdit(m.id, m.name, travel)}
              sx={{ p: 0.5, color: 'primary.main' }}
            >
              <EditIcon sx={{ fontSize: 15 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setDeleteConfirm({ id: m.id, name: m.name })}
              sx={{ p: 0.5, color: 'error.main' }}
            >
              <DeleteIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Box>
        ))}
    </Stack>
  );

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Travel & Pay Modes</DialogTitle>
        <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{ px: 3, pt: 2, pb: 2, flexShrink: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              {editingId ? 'Edit Mode' : 'Add New'}
            </Typography>
            <RadioGroup row value={isTravelMode ? 'travel' : 'pay'} onChange={(e) => setIsTravelMode(e.target.value === 'travel')} sx={{ mb: 1 }}>
              <FormControlLabel value="travel" control={<Radio size="small" />} label="Travel Mode" />
              <FormControlLabel value="pay" control={<Radio size="small" />} label="Pay Mode" />
            </RadioGroup>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <TextField
                size="small"
                label="Name"
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(''); }}
                error={!!nameError}
                helperText={nameError}
                fullWidth
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                sx={{ minWidth: 90, flexShrink: 0, height: 40 }}
                startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <CheckIcon />}
              >
                {editingId ? 'Update' : 'Add'}
              </Button>
              {editingId && (
                <IconButton onClick={resetForm} sx={{ height: 40, width: 40, flexShrink: 0 }}>
                  <CloseIcon />
                </IconButton>
              )}
            </Box>
          </Box>

          <Box sx={{ overflowY: 'auto', flex: 1, px: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                <DirectionsBusIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Travel Modes</Typography>
              </Box>
              <ModeList modes={travelModes} travel={true} />
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                <PaymentIcon fontSize="small" color="secondary" />
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Pay Modes</Typography>
              </Box>
              <ModeList modes={payModes} travel={false} />
            </Box>
          </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Mode</DialogTitle>
        <DialogContent>
          <Typography>
            Delete <strong>{deleteConfirm?.name}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (!deleteConfirm) return;
              remove(deleteConfirm.id, { onSuccess: () => setDeleteConfirm(null) });
            }}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={14} color="inherit" /> : <DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
