import {
  Button, TextField, Box, Typography, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { useExpenseTypes } from '../../expenses/hooks/useMasterData';
import { useSaveExpenseType, useDeleteExpenseType } from '../hooks/useAdminMaster';
import { ManagedItemDialog } from '../../../components/common/ManagedItemDialog';
import { DeleteConfirmDialog } from '../../../components/common/DeleteConfirmDialog';

interface Props { open: boolean; onClose: () => void; asPanel?: boolean; }

export const ExpenseTypeManagementDialog = ({ open, onClose, asPanel = false }: Props) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  const { data: expenseTypes = [] } = useExpenseTypes();
  const { mutate: save, isPending: saving } = useSaveExpenseType();
  const { mutate: remove, isPending: deleting } = useDeleteExpenseType();

  const resetForm = () => { setName(''); setNameError(''); setEditingId(null); };

  const handleEdit = (id: number, typeName: string) => {
    setEditingId(id);
    setName(typeName);
    setNameError('');
  };

  const handleSave = () => {
    if (!name.trim()) { setNameError('Name is required'); return; }
    save({ id: editingId ?? 0, name: name.trim() }, { onSuccess: resetForm });
  };

  const formSection = (
    <Box sx={{ px: 3, pt: 2, pb: 2, flexShrink: 0 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        {editingId ? 'Edit Expense Type' : 'Add New'}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <TextField
          size="small" label="Expense Type Name" value={name} fullWidth
          onChange={(e) => { setName(e.target.value); setNameError(''); }}
          error={!!nameError} helperText={nameError}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />
        <Button variant="contained" onClick={handleSave} disabled={saving}
          sx={{ minWidth: 90, flexShrink: 0, height: 40 }}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : (editingId ? <CheckIcon /> : <AddIcon />)}>
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
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
        Existing Types ({expenseTypes.length})
      </Typography>
      {expenseTypes.length === 0 ? (
        <Typography variant="caption" color="text.secondary">No expense types added yet</Typography>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 300 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenseTypes.map((t) => (
                <TableRow key={t.id} hover selected={editingId === t.id}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton size="small" color="primary" onClick={() => handleEdit(t.id, t.name)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteConfirm({ id: t.id, name: t.name })}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
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
