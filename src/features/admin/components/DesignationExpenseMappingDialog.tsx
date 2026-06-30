import {
  Button, Box, Typography, Select, MenuItem, TextField, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, FormControl, InputLabel, Grid,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import {
  useDesignations,
  useDesignationExpenseMaps,
  useSaveDesignationExpenseMap,
  useDeleteDesignationExpenseMap,
} from '../hooks/useAdminMaster';
import { useExpenseTypes } from '../../expenses/hooks/useMasterData';
import { formatCurrency } from '../../../utils/formatters';
import { ManagedItemDialog } from '../../../components/common/ManagedItemDialog';
import { DeleteConfirmDialog } from '../../../components/common/DeleteConfirmDialog';
import type { DesignationExpenseMap } from '../../../types/expense.types';

interface Props { open: boolean; onClose: () => void; asPanel?: boolean; }

const EMPTY = { designationId: '', expenseTypeId: '', amountRangeFrom: '', amountRangeTo: '' };

export const DesignationExpenseMappingDialog = ({ open, onClose, asPanel = false }: Props) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<typeof EMPTY>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; label: string } | null>(null);

  const { data: designations = [] } = useDesignations();
  const { data: expenseTypes = [] } = useExpenseTypes();
  const { data: maps = [], isLoading } = useDesignationExpenseMaps();
  const { mutate: save, isPending: isSaving } = useSaveDesignationExpenseMap();
  const { mutate: remove, isPending: isDeleting } = useDeleteDesignationExpenseMap();

  const resetForm = () => { setForm(EMPTY); setErrors({}); setEditingId(null); };

  const validate = () => {
    const e: Partial<typeof EMPTY> = {};
    if (!form.designationId) e.designationId = 'Required';
    if (!form.expenseTypeId) e.expenseTypeId = 'Required';
    if (!form.amountRangeFrom) e.amountRangeFrom = 'Required';
    if (!form.amountRangeTo) e.amountRangeTo = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleEdit = (map: DesignationExpenseMap) => {
    setEditingId(map.id);
    setForm({
      designationId: String(map.designationId),
      expenseTypeId: String(map.expenseTypeId),
      amountRangeFrom: String(map.amountRangeFrom),
      amountRangeTo: String(map.amountRangeTo),
    });
    setErrors({});
  };

  const handleSave = () => {
    if (!validate()) return;
    save({
      id: editingId ?? 0,
      designationId: Number(form.designationId),
      expenseTypeId: Number(form.expenseTypeId),
      amountRangeFrom: Number(form.amountRangeFrom),
      amountRangeTo: Number(form.amountRangeTo),
    }, { onSuccess: resetForm });
  };

  const designationName = (id: number) => designations.find(d => d.id === id)?.designationName ?? id;
  const expenseTypeName = (id: number) => expenseTypes.find(e => e.id === id)?.name ?? id;

  const formSection = (
    <Box sx={{ px: 3, pt: 2, pb: 2, flexShrink: 0 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
        {editingId !== null ? 'Edit Mapping' : 'Add New'}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small" error={!!errors.designationId}>
            <InputLabel>Designation *</InputLabel>
            <Select label="Designation *" value={form.designationId}
              onChange={(e) => setForm(f => ({ ...f, designationId: String(e.target.value) }))}>
              {designations.map(d => <MenuItem key={d.id} value={d.id}>{d.designationName}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small" error={!!errors.expenseTypeId}>
            <InputLabel>Expense Type *</InputLabel>
            <Select label="Expense Type *" value={form.expenseTypeId}
              onChange={(e) => setForm(f => ({ ...f, expenseTypeId: String(e.target.value) }))}>
              {expenseTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField size="small" label="Amount Range From *" type="number" fullWidth
            value={form.amountRangeFrom} error={!!errors.amountRangeFrom}
            onChange={(e) => setForm(f => ({ ...f, amountRangeFrom: e.target.value }))} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField size="small" label="Amount Range To *" type="number" fullWidth
            value={form.amountRangeTo} error={!!errors.amountRangeTo}
            onChange={(e) => setForm(f => ({ ...f, amountRangeTo: e.target.value }))} />
        </Grid>
        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {editingId !== null && (
            <Button variant="outlined" onClick={resetForm} disabled={isSaving}>Cancel</Button>
          )}
          <Button variant="contained" onClick={handleSave} disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : (editingId !== null ? <EditIcon /> : <AddIcon />)}
            sx={{ minWidth: 120 }}>
            {editingId !== null ? 'Update' : 'Add'}
          </Button>
        </Grid>
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
            <Table size="small" stickyHeader sx={{ minWidth: 480 }}>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Expense Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Amount From</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">Amount To</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 90 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {maps.map(m => (
                  <TableRow key={m.id} hover selected={m.id === editingId}>
                    <TableCell>{designationName(m.designationId)}</TableCell>
                    <TableCell>{expenseTypeName(m.expenseTypeId)}</TableCell>
                    <TableCell align="right">{formatCurrency(m.amountRangeFrom)}</TableCell>
                    <TableCell align="right">{formatCurrency(m.amountRangeTo)}</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                      <IconButton size="small" color="primary" onClick={() => handleEdit(m)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error"
                        onClick={() => setDeleteConfirm({
                          id: m.id,
                          label: `${designationName(m.designationId)} - ${expenseTypeName(m.expenseTypeId)}`,
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
      title="Designation Expense Limits" maxWidth="md"
      extras={
        <DeleteConfirmDialog
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => {
            if (!deleteConfirm) return;
            remove(deleteConfirm.id, {
              onSuccess: () => {
                if (editingId === deleteConfirm.id) resetForm();
                setDeleteConfirm(null);
              },
            });
          }}
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
