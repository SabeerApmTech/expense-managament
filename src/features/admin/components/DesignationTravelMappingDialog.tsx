import {
  Button, Box, Typography, Select, MenuItem, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, FormControl, InputLabel, Grid,
  IconButton, Chip, OutlinedInput,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import {
  useDesignations, useDesignationTravelMaps,
  useSaveDesignationTravelMap, useDeleteDesignationTravelMap,
} from '../hooks/useAdminMaster';
import { useTravelModes } from '../../expenses/hooks/useMasterData';
import { ManagedItemDialog } from '../../../components/common/ManagedItemDialog';
import { DeleteConfirmDialog } from '../../../components/common/DeleteConfirmDialog';
import type { DesignationTravelMap } from '../../../types/expense.types';

interface Props { open: boolean; onClose: () => void; asPanel?: boolean; }

const EMPTY = { designationId: '', travelModeIds: [] as number[] };
type FormErrors = { designationId?: string; travelModeIds?: string };

export const DesignationTravelMappingDialog = ({ open, onClose, asPanel = false }: Props) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; label: string } | null>(null);

  const { data: designations = [] } = useDesignations();
  const { data: travelModes = [] } = useTravelModes();
  const { data: maps = [], isLoading } = useDesignationTravelMaps();
  const { mutate: save, isPending: isSaving } = useSaveDesignationTravelMap();
  const { mutate: del, isPending: isDeleting } = useDeleteDesignationTravelMap();

  const parseTravelModeIds = (travelModeId: string): number[] =>
    travelModeId.toString().split(',').map(id => Number(id.trim())).filter(Boolean);

  const alreadyMappedIds = new Set(
    form.designationId
      ? maps
          .filter(m => m.designationId === Number(form.designationId) && m.id !== (editingId ?? -1))
          .flatMap(m => parseTravelModeIds(m.travelModeId))
      : []
  );
  const availableTravelModes = travelModes.filter(t => !alreadyMappedIds.has(t.id));

  const resetForm = () => { setForm(EMPTY); setErrors({}); setEditingId(null); };

  const handleEdit = (m: DesignationTravelMap) => {
    setForm({
      designationId: String(m.designationId),
      travelModeIds: parseTravelModeIds(m.travelModeId),
    });
    setErrors({}); setEditingId(m.id);
  };

  const handleSave = () => {
    const e: FormErrors = {};
    if (!form.designationId) e.designationId = 'Required';
    if (form.travelModeIds.length === 0) e.travelModeIds = 'Required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    save({
      id: editingId ?? 0,
      designationId: Number(form.designationId),
      travelModeIds: form.travelModeIds,
    }, { onSuccess: resetForm });
  };

  const getDesignationName = (id: number) => designations.find(d => d.id === id)?.designationName ?? String(id);
  const getTravelModeNames = (travelModeIdStr: string) =>
    parseTravelModeIds(travelModeIdStr)
      .map(id => travelModes.find(t => t.id === id)?.name ?? String(id))
      .join(', ');

  const formSection = (
    <Box sx={{ px: 3, pt: 2, pb: 2, flexShrink: 0 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
        {editingId ? 'Edit Mapping' : 'Add New'}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, sm: 5 }}>
          <FormControl fullWidth size="small" error={!!errors.designationId}>
            <InputLabel>Designation *</InputLabel>
            <Select label="Designation *" value={form.designationId}
              onChange={(e) => setForm({ designationId: String(e.target.value), travelModeIds: [] })}>
              {designations.map(d => <MenuItem key={d.id} value={d.id}>{d.designationName}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 5 }}>
          <FormControl fullWidth size="small" error={!!errors.travelModeIds}>
            <InputLabel>Travel Mode *</InputLabel>
            <Select
              multiple
              label="Travel Mode *"
              value={form.travelModeIds}
              onChange={(e) => setForm(f => ({ ...f, travelModeIds: e.target.value as number[] }))}
              input={<OutlinedInput label="Travel Mode *" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as number[]).map(id => (
                    <Chip key={id} label={travelModes.find(t => t.id === id)?.name ?? String(id)} size="small" />
                  ))}
                </Box>
              )}
            >
              {availableTravelModes.length === 0 && form.travelModeIds.length === 0
                ? <MenuItem disabled value=""><em>All modes mapped</em></MenuItem>
                : availableTravelModes.map(t => (
                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                  ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <Button variant="contained" fullWidth onClick={handleSave} disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
            sx={{ height: 40 }}>
            {editingId ? 'Update' : 'Add'}
          </Button>
        </Grid>
        {editingId && (
          <Grid size={{ xs: 12 }}>
            <Button size="small" onClick={resetForm} sx={{ textTransform: 'none' }}>Cancel edit</Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  const listSection = (
    <Box sx={{ px: 3, pb: 2 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
          <CircularProgress size={32} />
        </Box>
      ) : maps.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Existing Mappings</Typography>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Table size="small" stickyHeader sx={{ minWidth: 300 }}>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Travel Mode</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 80 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...maps]
                  .sort((a, b) => getDesignationName(a.designationId).localeCompare(getDesignationName(b.designationId)))
                  .map(m => (
                  <TableRow key={m.id} hover selected={m.id === editingId}>
                    <TableCell>{getDesignationName(m.designationId)}</TableCell>
                    <TableCell>{getTravelModeNames(m.travelModeId)}</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                      <IconButton size="small" color="primary" onClick={() => handleEdit(m)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error"
                        onClick={() => setDeleteConfirm({
                          id: m.id,
                          label: `${getDesignationName(m.designationId)} → ${getTravelModeNames(m.travelModeId)}`,
                        })}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <ManagedItemDialog
      open={open} onClose={onClose} asPanel={asPanel}
      title="Designation Travel Eligibility"
      extras={
        <DeleteConfirmDialog
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => { if (deleteConfirm) del(deleteConfirm.id, { onSuccess: () => setDeleteConfirm(null) }); }}
          isDeleting={isDeleting}
          title="Delete Mapping"
          message={deleteConfirm ? <>Delete mapping <strong>{deleteConfirm.label}</strong>? This cannot be undone.</> : undefined}
        />
      }
    >
      {formSection}
      {listSection}
    </ManagedItemDialog>
  );
};
