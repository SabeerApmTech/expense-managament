import {
  Button, RadioGroup, FormControlLabel, Radio, TextField, Box, Typography,
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
import { ManagedItemDialog } from '../../../components/common/ManagedItemDialog';
import { DeleteConfirmDialog } from '../../../components/common/DeleteConfirmDialog';

interface Props { open: boolean; onClose: () => void; asPanel?: boolean; }

export const TravelPayModeDialog = ({ open, onClose, asPanel = false }: Props) => {
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
    setEditingId(id); setIsTravelMode(travel); setName(modeName); setNameError('');
  };

  const handleSave = () => {
    if (!name.trim()) { setNameError('Name is required'); return; }
    const now = new Date().toISOString();
    save({
      travelorPaymentMode: {
        id: editingId ?? 0, name: name.trim(), isTravelMode,
        createdBy: user?.id ?? '', createdDate: now,
        updatedBy: user?.id ?? '', updatedDate: now,
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
            <IconButton size="small" onClick={() => handleEdit(m.id, m.name, travel)} sx={{ p: 0.5, color: 'primary.main' }}>
              <EditIcon sx={{ fontSize: 15 }} />
            </IconButton>
            <IconButton size="small" onClick={() => setDeleteConfirm({ id: m.id, name: m.name })} sx={{ p: 0.5, color: 'error.main' }}>
              <DeleteIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Box>
        ))}
    </Stack>
  );

  const formSection = (
    <Box sx={{ px: 3, pt: 2, pb: 2, flexShrink: 0 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        {editingId ? 'Edit Mode' : 'Add New'}
      </Typography>
      <RadioGroup row value={isTravelMode ? 'travel' : 'pay'}
        onChange={(e) => setIsTravelMode(e.target.value === 'travel')} sx={{ mb: 1 }}>
        <FormControlLabel value="travel" control={<Radio size="small" />} label="Travel Mode" />
        <FormControlLabel value="pay" control={<Radio size="small" />} label="Pay Mode" />
      </RadioGroup>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <TextField size="small" label="Name" value={name} fullWidth
          onChange={(e) => { setName(e.target.value); setNameError(''); }}
          error={!!nameError} helperText={nameError}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
        <Button variant="contained" onClick={handleSave} disabled={saving}
          sx={{ minWidth: 90, flexShrink: 0, height: 40 }}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <CheckIcon />}>
          {editingId ? 'Update' : 'Add'}
        </Button>
        {editingId && (
          <IconButton onClick={resetForm} sx={{ height: 40, width: 40, flexShrink: 0 }}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );

  const listSection = (
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
  );

  return (
    <ManagedItemDialog
      open={open} onClose={onClose} asPanel={asPanel}
      title="Travel & Pay Modes"
      extras={
        <DeleteConfirmDialog
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => { if (deleteConfirm) remove(deleteConfirm.id, { onSuccess: () => setDeleteConfirm(null) }); }}
          isDeleting={deleting}
          title="Delete Mode"
          message={deleteConfirm ? <>Delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</> : undefined}
        />
      }
    >
      {formSection}
      {listSection}
    </ManagedItemDialog>
  );
};
