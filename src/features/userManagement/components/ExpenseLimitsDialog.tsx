import {
  Button, TextField, Box, Typography, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton,
  FormControl, Select, MenuItem, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { ManagedItemDialog } from '../../../components/common/ManagedItemDialog';
import { DeleteConfirmDialog } from '../../../components/common/DeleteConfirmDialog';
import { useExpenseTypes } from '../../expenseTypes/hooks/useExpenseTypes';
import { useExpenseTypeUsage } from '../../expenses/hooks/useExpenseTypeUsage';
import {
  useCreateUserExpenseTypeLimit,
  useUpdateUserExpenseTypeLimit, useDeleteUserExpenseTypeLimit,
} from '../hooks/useUserManagement';
import { useAuthContext } from '../../../store/authStore';
import { formatCurrency } from '../../../utils/formatters';
import type { UserAccount } from '../../../types/user.types';

interface Props {
  open: boolean;
  onClose: () => void;
  targetUser: UserAccount | null;
}

export const ExpenseLimitsDialog = ({ open, onClose, targetUser }: Props) => {
  const empId = targetUser?.empId ?? null;
  const { user: currentUser } = useAuthContext();
  const { data: expenseTypes = [] } = useExpenseTypes();
  const { data: limits = [], isLoading } = useExpenseTypeUsage(empId ?? undefined);
  const { mutate: create, isPending: creating } = useCreateUserExpenseTypeLimit();
  const { mutate: update, isPending: updating } = useUpdateUserExpenseTypeLimit();
  const { mutate: remove, isPending: deleting } = useDeleteUserExpenseTypeLimit();

  const [expenseTypeId, setExpenseTypeId] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; label: string } | null>(null);

  const resetForm = () => { setExpenseTypeId(''); setAmount(''); setError(''); setEditingId(null); };

  const handleClose = () => { resetForm(); onClose(); };

  const handleEdit = (limit: (typeof limits)[number]) => {
    setEditingId(limit.userExpenseTypeId);
    setExpenseTypeId(String(limit.expenseTypeId));
    setAmount(String(limit.limitAmount));
    setError('');
  };

  const handleSave = () => {
    if (!empId || !currentUser) return;
    const numericAmount = parseFloat(amount);
    if (!expenseTypeId && !editingId) { setError('Select an expense type'); return; }
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) { setError('Enter a valid limit amount'); return; }

    if (editingId) {
      update(
        { userExpenseTypeId: editingId, payload: { limitAmount: numericAmount, updatedByEmpId: currentUser.empId } },
        { onSuccess: resetForm }
      );
    } else {
      create(
        { empId, expenseTypeId: Number(expenseTypeId), limitAmount: numericAmount, createdByEmpId: currentUser.empId },
        { onSuccess: resetForm }
      );
    }
  };

  const isSaving = creating || updating;

  return (
    <ManagedItemDialog
      open={open}
      onClose={handleClose}
      title={targetUser ? `Expense Limits — ${targetUser.empName}` : 'Expense Limits'}
      extras={
        <DeleteConfirmDialog
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => {
            if (deleteConfirm && currentUser) {
              remove(
                { userExpenseTypeId: deleteConfirm.id, deletedByEmpId: currentUser.empId },
                { onSuccess: () => setDeleteConfirm(null) }
              );
            }
          }}
          isDeleting={deleting}
          title="Delete Expense Limit"
          message={deleteConfirm ? <>Delete the limit for <strong>{deleteConfirm.label}</strong>? This cannot be undone.</> : undefined}
        />
      }
    >
      <Box sx={{ px: 3, pt: 2, pb: 2, flexShrink: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          {editingId ? 'Edit Limit' : 'Add Limit'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 180 }} disabled={!!editingId}>
            <Select value={expenseTypeId} onChange={(e) => setExpenseTypeId(e.target.value)} displayEmpty>
              <MenuItem value=""><em>Select Expense Type</em></MenuItem>
              {expenseTypes
                .filter((t) => !limits.some((l) => l.expenseTypeId === t.expenseTypeId) || String(t.expenseTypeId) === expenseTypeId)
                .map((t) => (
                  <MenuItem key={t.expenseTypeId} value={String(t.expenseTypeId)}>{t.expenseTypeName}</MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            size="small" label="Limit Amount" type="number" value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ width: 160 }}
          />
          <Button variant="contained" onClick={handleSave} disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : (editingId ? <CheckIcon /> : <AddIcon />)}>
            {editingId ? 'Update' : 'Add'}
          </Button>
          {editingId && (
            <IconButton onClick={resetForm} sx={{ height: 40, width: 40 }}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        {error && <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>{error}</Typography>}
      </Box>

      <Box sx={{ px: 3, pb: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress size={32} /></Box>
        ) : limits.length === 0 ? (
          <Typography variant="caption" color="text.secondary">No expense limits set yet</Typography>
        ) : (
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Expense Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Limit</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {limits.map((limit) => (
                <TableRow key={limit.userExpenseTypeId} hover selected={editingId === limit.userExpenseTypeId}>
                  <TableCell>{limit.expenseTypeName}</TableCell>
                  <TableCell><Chip size="small" label={limit.expenseCategory} variant="outlined" /></TableCell>
                  <TableCell>{formatCurrency(limit.limitAmount)}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton size="small" color="primary" onClick={() => handleEdit(limit)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteConfirm({ id: limit.userExpenseTypeId, label: limit.expenseTypeName })}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </ManagedItemDialog>
  );
};
