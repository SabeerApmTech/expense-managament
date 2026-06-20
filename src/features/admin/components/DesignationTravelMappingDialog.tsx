import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, Select, MenuItem, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, FormControl, InputLabel, Grid,
  IconButton, DialogContentText,
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

interface Props { open: boolean; onClose: () => void; }

const EMPTY = { designationId: '', travelModeId: '' };

export const DesignationTravelMappingDialog = ({ open, onClose }: Props) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<typeof EMPTY>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; label: string } | null>(null);

  const { data: designations = [] } = useDesignations();
  const { data: travelModes = [] } = useTravelModes();
  const { data: maps = [] } = useDesignationTravelMaps();
  const { mutate: save, isPending: isSaving } = useSaveDesignationTravelMap();
  const { mutate: del, isPending: isDeleting } = useDeleteDesignationTravelMap();

  const alreadyMappedIds = new Set(
    form.designationId
      ? maps
          .filter(m => m.designationId === Number(form.designationId) && m.id !== (editingId ?? -1))
          .map(m => m.travelModeId)
      : []
  );
  const availableTravelModes = travelModes.filter(t => !alreadyMappedIds.has(t.id));

  const resetForm = () => {
    setForm(EMPTY);
    setErrors({});
    setEditingId(null);
  };

  const handleEdit = (m: { id: number; designationId: number; travelModeId: number }) => {
    setForm({ designationId: String(m.designationId), travelModeId: String(m.travelModeId) });
    setErrors({});
    setEditingId(m.id);
  };

  const handleSave = () => {
    const e: Partial<typeof EMPTY> = {};
    if (!form.designationId) e.designationId = 'Required';
    if (!form.travelModeId) e.travelModeId = 'Required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    save(
      {
        id: editingId ?? 0,
        designationId: Number(form.designationId),
        travelModeId: Number(form.travelModeId),
      },
      { onSuccess: resetForm },
    );
  };

  const handleDeleteConfirm = () => {
    if (!deleteConfirm) return;
    del(deleteConfirm.id, { onSuccess: () => setDeleteConfirm(null) });
  };

  const getDesignationName = (id: number) => designations.find(d => d.id === id)?.designationName ?? String(id);
  const getTravelModeName = (id: number) => travelModes.find(t => t.id === id)?.name ?? String(id);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Designation Travel Eligibility</DialogTitle>
        <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{ px: 3, pt: 2, pb: 2, flexShrink: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
            {editingId ? 'Edit Mapping' : 'Add New'}
          </Typography>
          <Grid container spacing={2} sx={{ mb: 1 }}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <FormControl fullWidth size="small" error={!!errors.designationId}>
                <InputLabel>Designation *</InputLabel>
                <Select
                  label="Designation *"
                  value={form.designationId}
                  onChange={(e) => setForm({ designationId: String(e.target.value), travelModeId: '' })}
                >
                  {designations.map(d => <MenuItem key={d.id} value={d.id}>{d.designationName}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 5 }}>
              <FormControl fullWidth size="small" error={!!errors.travelModeId}>
                <InputLabel>Travel Mode *</InputLabel>
                <Select
                  label="Travel Mode *"
                  value={form.travelModeId}
                  onChange={(e) => setForm(f => ({ ...f, travelModeId: String(e.target.value) }))}
                >
                  {availableTravelModes.length === 0
                    ? <MenuItem disabled value=""><em>All modes mapped</em></MenuItem>
                    : availableTravelModes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }} sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSave}
                disabled={isSaving}
                startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
                sx={{ height: 40 }}
              >
                {editingId ? 'Update' : 'Add'}
              </Button>
            </Grid>
            {editingId && (
              <Grid size={{ xs: 12 }}>
                <Button size="small" onClick={resetForm} sx={{ textTransform: 'none' }}>
                  Cancel edit
                </Button>
              </Grid>
            )}
          </Grid>
          </Box>

          <Box sx={{ overflowY: 'auto', flex: 1, px: 3, pb: 2 }}>
          {maps.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Existing Mappings</Typography>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 300 }}>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Travel Mode</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: 80 }} align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {maps.map(m => (
                        <TableRow key={m.id} hover selected={m.id === editingId}>
                          <TableCell>{getDesignationName(m.designationId)}</TableCell>
                          <TableCell>{getTravelModeName(m.travelModeId)}</TableCell>
                          <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                            <IconButton size="small" color="primary" onClick={() => handleEdit(m)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                setDeleteConfirm({
                                  id: m.id,
                                  label: `${getDesignationName(m.designationId)} → ${getTravelModeName(m.travelModeId)}`,
                                })
                              }
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            </Box>
          )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Mapping</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete mapping <strong>{deleteConfirm?.label}</strong>? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={14} color="inherit" /> : <DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
