import {
  Button, Box, Typography, Select, MenuItem, TextField, CircularProgress, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow, FormControl, InputLabel, Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import {
  useLevels, useExpenseLevelMaps,
  useSaveExpenseLevelMap, useUpdateExpenseLevelMap, useDeleteExpenseLevelMap,
} from '../hooks/useAdminMaster';
import { useExpenseTypes } from '../../expenses/hooks/useMasterData';
import { formatCurrency } from '../../../utils/formatters';
import { ManagedItemDialog } from '../../../components/common/ManagedItemDialog';
import { DeleteConfirmDialog } from '../../../components/common/DeleteConfirmDialog';
import type { ExpenseLevelMap } from '../../../types/expense.types';

interface Props { open: boolean; onClose: () => void; asPanel?: boolean; }

const EMPTY = { levelId: '', expenseId: '', fromRange: '', toRange: '' };

export const LevelExpenseMappingDialog = ({ open, onClose, asPanel = false }: Props) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<typeof EMPTY>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const { data: levels = [] } = useLevels();
  const { data: expenseTypes = [] } = useExpenseTypes();
  const { data: maps = [] } = useExpenseLevelMaps();
  const { mutate: saveMap, isPending: isSaving } = useSaveExpenseLevelMap();
  const { mutate: updateMap, isPending: isUpdating } = useUpdateExpenseLevelMap();
  const { mutate: deleteMap, isPending: isDeleting } = useDeleteExpenseLevelMap();

  const isPending = isSaving || isUpdating;

  const selectedLevelName = levels.find(l => l.id === Number(form.levelId))?.name;
  const alreadyMappedExpenseIds = new Set(
    maps
      .filter(m => m.level === selectedLevelName && m.id !== editingId)
      .map(m => expenseTypes.find(e => e.name === m.expenseType)?.id)
      .filter((id): id is number => id !== undefined)
  );
  const availableExpenseTypes = expenseTypes.filter(t => !alreadyMappedExpenseIds.has(t.id));

  const validate = () => {
    const e: Partial<typeof EMPTY> = {};
    if (!form.levelId) e.levelId = 'Required';
    if (!form.expenseId) e.expenseId = 'Required';
    if (!form.fromRange) e.fromRange = 'Required';
    if (!form.toRange) e.toRange = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = {
      levelId: Number(form.levelId), expenseId: Number(form.expenseId),
      fromRange: Number(form.fromRange), toRange: Number(form.toRange),
    };
    if (editingId !== null) {
      updateMap({ id: editingId, ...payload }, { onSuccess: resetForm });
    } else {
      saveMap(payload, { onSuccess: resetForm });
    }
  };

  const resetForm = () => { setForm(EMPTY); setErrors({}); setEditingId(null); };

  const handleStartEdit = (row: ExpenseLevelMap) => {
    const matchedLevel = levels.find(l => l.name === row.level);
    const matchedExpense = expenseTypes.find(e => e.name === row.expenseType);
    setEditingId(row.id);
    setForm({
      levelId: String(matchedLevel?.id ?? ''), expenseId: String(matchedExpense?.id ?? ''),
      fromRange: String(row.fromRange), toRange: String(row.toRange),
    });
    setErrors({});
  };

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
              onChange={(e) => setForm(f => ({ ...f, levelId: String(e.target.value), expenseId: '' }))}>
              {levels.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small" error={!!errors.expenseId}>
            <InputLabel>Expense Type *</InputLabel>
            <Select label="Expense Type *" value={form.expenseId}
              onChange={(e) => setForm(f => ({ ...f, expenseId: String(e.target.value) }))}>
              {availableExpenseTypes.length === 0
                ? <MenuItem disabled value=""><em>All types mapped for this level</em></MenuItem>
                : availableExpenseTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField size="small" label="Amount From *" type="number" fullWidth
            value={form.fromRange} error={!!errors.fromRange}
            onChange={(e) => setForm(f => ({ ...f, fromRange: e.target.value }))} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField size="small" label="Amount To *" type="number" fullWidth
            value={form.toRange} error={!!errors.toRange}
            onChange={(e) => setForm(f => ({ ...f, toRange: e.target.value }))} />
        </Grid>
        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {editingId !== null && (
            <Button variant="outlined" onClick={resetForm} disabled={isPending}>Cancel</Button>
          )}
          <Button variant="contained" onClick={handleSubmit} disabled={isPending}
            startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
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
              <Table size="small" sx={{ minWidth: 480 }}>
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Level</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Expense Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">From</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">To</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 80 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {maps.map(m => (
                    <TableRow key={m.id} hover selected={editingId === m.id}>
                      <TableCell>{m.level}</TableCell>
                      <TableCell>{m.expenseType}</TableCell>
                      <TableCell align="right">{formatCurrency(m.fromRange)}</TableCell>
                      <TableCell align="right">{formatCurrency(m.toRange)}</TableCell>
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
      title="Level Expense Mapping" maxWidth="md"
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
