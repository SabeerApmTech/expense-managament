import {
  Button, TextField, Box, Typography, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton,
  FormControl, Select, MenuItem, Chip, FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { useExpenseTypes } from '../hooks/useExpenseTypes';
import { useCreateExpenseType, useDeleteExpenseType } from '../hooks/useExpenseTypeAdmin';
import { ManagedItemDialog } from '../../../components/common/ManagedItemDialog';
import { DeleteConfirmDialog } from '../../../components/common/DeleteConfirmDialog';
import { useAuthContext } from '../../../store/authStore';
import { EXPENSE_CATEGORY_OPTIONS } from '../../../constants/masterData';
import type { ExpenseCategory } from '../../../types/expenseType.types';

interface Props { open: boolean; onClose: () => void; asPanel?: boolean; }

// Note: the backend has no update endpoint for expense types ("no put method for
// safety"), so this dialog only supports add + delete, not edit-in-place.
export const ExpenseTypeManagementDialog = ({ open, onClose, asPanel = false }: Props) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | ''>('');
  const [nameError, setNameError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  const { data: expenseTypes = [], isLoading } = useExpenseTypes();
  const { user } = useAuthContext();
  const { mutate: save, isPending: saving } = useCreateExpenseType();
  const { mutate: remove, isPending: deleting } = useDeleteExpenseType();

  const handleSave = () => {
    const missingName = !name.trim();
    const missingCategory = !category;
    setNameError(missingName ? 'Name is required' : '');
    setCategoryError(missingCategory ? 'Category is required' : '');
    if (missingName || missingCategory) return;
    save({
      expenseTypeName: name.trim(),
      expenseCategory: category,
      createdByEmpId: user?.empId || '',
      createdByEmpName: user?.empName || '',
    }, { onSuccess: () => { setName(''); setCategory(''); setNameError(''); setCategoryError(''); } });
  };

  const formSection = (
    <Box sx={{ px: 3, pt: 2, pb: 2, flexShrink: 0 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Add New</Typography>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <TextField
          size="small" label="Expense Type Name" value={name} sx={{ minWidth: 180 }}
          onChange={(e) => { setName(e.target.value); setNameError(''); }}
          error={!!nameError} helperText={nameError}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <FormControl size="small" error={!!categoryError} sx={{ minWidth: 140 }}>
          <Select
            value={category}
            onChange={(e) => { setCategory(e.target.value as ExpenseCategory); setCategoryError(''); }}
            displayEmpty
          >
            <MenuItem value=""><em>Select Category</em></MenuItem>
            {EXPENSE_CATEGORY_OPTIONS.map((c) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </Select>
          {categoryError && <FormHelperText>{categoryError}</FormHelperText>}
        </FormControl>
        <Button variant="contained" onClick={handleSave} disabled={saving}
          sx={{ minWidth: 90, flexShrink: 0, height: 40 }}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}>
          Add
        </Button>
      </Box>
    </Box>
  );

  const listSection = (
    <Box sx={{ px: 3, pb: 2 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
      <>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Existing Types ({expenseTypes.length})
      </Typography>
      {expenseTypes.length === 0 ? (
        <Typography variant="caption" color="text.secondary">No expense types added yet</Typography>
      ) : (
        <Table size="small" stickyHeader sx={{ minWidth: 300 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenseTypes.map((t) => (
                <TableRow key={t.expenseTypeId} hover>
                  <TableCell>{t.expenseTypeName}</TableCell>
                  <TableCell><Chip size="small" label={t.expenseCategory} variant="outlined" /></TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton size="small" color="error" onClick={() => setDeleteConfirm({ id: t.expenseTypeId, name: t.expenseTypeName })}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      )}
      </>
      )}
    </Box>
  );

  return (
    <ManagedItemDialog
      open={open} onClose={onClose} asPanel={asPanel}
      title="Expense Types"
      extras={
        <DeleteConfirmDialog
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => { if (deleteConfirm) remove(deleteConfirm.id, { onSuccess: () => setDeleteConfirm(null) }); }}
          isDeleting={deleting}
          title="Delete Expense Type"
          message={deleteConfirm ? <>Delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</> : undefined}
        />
      }
    >
      {formSection}
      {listSection}
    </ManagedItemDialog>
  );
};
