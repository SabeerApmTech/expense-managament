import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, Typography, CircularProgress, Table, TableBody,
  TableCell, TableHead, TableRow, IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';
import { useExpenseTypes } from '../../expenses/hooks/useMasterData';
import { useSaveExpenseType, useDeleteExpenseType } from '../hooks/useAdminMaster';

interface Props { open: boolean; onClose: () => void; }

export const ExpenseTypeManagementDialog = ({ open, onClose }: Props) => {
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
    save(
      { id: editingId ?? 0, name: name.trim() },
      { onSuccess: resetForm },
    );
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Expense Types</DialogTitle>
        <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{ px: 3, pt: 2, pb: 2, flexShrink: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              {editingId ? 'Edit Expense Type' : 'Add New'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <TextField
                size="small"
                label="Expense Type Name"
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
                startIcon={saving ? <CircularProgress size={14} color="inherit" /> : (editingId ? <CheckIcon /> : <AddIcon />)}
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
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Expense Type</DialogTitle>
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
