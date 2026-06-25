import {
  Button, Box, Typography, Select, MenuItem, CircularProgress, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow, FormControl, InputLabel, Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import {
  useLevels, useDesignations,
  useDesignationLevelMaps, useSaveDesignationLevelMap, useDeleteDesignationLevelMap,
} from '../hooks/useAdminMaster';
import { ManagedItemDialog } from '../../../components/common/ManagedItemDialog';
import { DeleteConfirmDialog } from '../../../components/common/DeleteConfirmDialog';
import type { DesignationLevelMap } from '../../../types/expense.types';

interface Props { open: boolean; onClose: () => void; asPanel?: boolean; }

const EMPTY = { levelId: '', designationId: '' };

export const LevelDesignationMappingDialog = ({ open, onClose, asPanel = false }: Props) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<typeof EMPTY>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const { data: levels = [] } = useLevels();
  const { data: designations = [] } = useDesignations();
  const { data: maps = [] } = useDesignationLevelMaps();
  const { mutate: saveMap, isPending: isSaving } = useSaveDesignationLevelMap();
  const { mutate: deleteMap, isPending: isDeleting } = useDeleteDesignationLevelMap();

  const validate = () => {
    const e: Partial<typeof EMPTY> = {};
    if (!form.levelId) e.levelId = 'Required';
    if (!form.designationId) e.designationId = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    saveMap({
      id: editingId ?? 0,
      levelId: Number(form.levelId), designationId: Number(form.designationId),
      fromRange: 0, toRange: 0,
    }, { onSuccess: resetForm });
  };

  const resetForm = () => { setForm(EMPTY); setErrors({}); setEditingId(null); };

  const handleStartEdit = (row: DesignationLevelMap) => {
    setEditingId(row.id);
    setForm({ levelId: String(row.levelId), designationId: String(row.designationId) });
    setErrors({});
  };

  const levelName = (id: number) => levels.find(l => l.id === id)?.name ?? id;
  const designationName = (id: number) => designations.find(d => d.id === id)?.designationName ?? id;

  const formSection = (
    <Box sx={{ px: 3, pt: 2, pb: 2, flexShrink: 0 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
        {editingId !== null ? 'Edit Mapping' : 'Add New'}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small" error={!!errors.levelId}>
            <InputLabel>Level *</InputLabel>
            <Select label="Level *" value={form.levelId}
              onChange={(e) => setForm(f => ({ ...f, levelId: String(e.target.value) }))}>
              {levels.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small" error={!!errors.designationId}>
            <InputLabel>Designation *</InputLabel>
            <Select label="Designation *" value={form.designationId}
              onChange={(e) => setForm(f => ({ ...f, designationId: String(e.target.value) }))}>
              {designations.map(d => <MenuItem key={d.id} value={d.id}>{d.designationName}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {editingId !== null && (
            <Button variant="outlined" onClick={resetForm} disabled={isSaving}>Cancel</Button>
          )}
          <Button variant="contained" onClick={handleSubmit} disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
            sx={{ minWidth: 120 }}>
            {editingId !== null ? 'Update' : 'Add'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const listSection = (
    <Box sx={{ overflowY: 'auto', flex: 1, px: 3, pb: 2 }}>
      {maps.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Existing Mappings</Typography>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 300 }}>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Level</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 80 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {maps.map(m => (
                    <TableRow key={m.id} hover selected={editingId === m.id}>
                      <TableCell>{m.levelName ?? levelName(m.levelId)}</TableCell>
                      <TableCell>{m.designationName ?? designationName(m.designationId)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <IconButton size="small" color="primary" onClick={() => handleStartEdit(m)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => setDeleteTargetId(m.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
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
  );

  return (
    <ManagedItemDialog
      open={open} onClose={onClose} asPanel={asPanel}
      title="Level Designation Mapping"
      extras={
        <DeleteConfirmDialog
          open={deleteTargetId !== null}
          onClose={() => setDeleteTargetId(null)}
          onConfirm={() => deleteMap(deleteTargetId!, { onSuccess: () => setDeleteTargetId(null) })}
          isDeleting={isDeleting}
          title="Delete Mapping"
        />
      }
    >
      {formSection}
      {listSection}
    </ManagedItemDialog>
  );
};
