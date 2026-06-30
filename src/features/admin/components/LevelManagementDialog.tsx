import {
  Button, TextField, Box, Typography, IconButton, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { useLevels, useSaveLevel, useUpdateLevel, useDeleteLevel } from '../hooks/useAdminMaster';
import { ManagedItemDialog } from '../../../components/common/ManagedItemDialog';
import { DeleteConfirmDialog } from '../../../components/common/DeleteConfirmDialog';

interface Props { open: boolean; onClose: () => void; asPanel?: boolean; }

export const LevelManagementDialog = ({ open, onClose, asPanel = false }: Props) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const { data: levels = [], isLoading } = useLevels();
  const { mutate: saveLevel, isPending: isSaving } = useSaveLevel();
  const { mutate: updateLevel, isPending: isUpdating } = useUpdateLevel();
  const { mutate: deleteLevel, isPending: isDeleting } = useDeleteLevel();

  const handleAdd = () => {
    if (!name.trim()) { setNameError('Name is required'); return; }
    saveLevel({ name: name.trim() }, { onSuccess: () => { setName(''); setNameError(''); } });
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || editingId === null) return;
    updateLevel({ id: editingId, name: editName.trim() }, {
      onSuccess: () => { setEditingId(null); setEditName(''); },
    });
  };

  const formSection = (
    <Box sx={{ px: 3, pt: 2, pb: 2, flexShrink: 0 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Add New</Typography>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <TextField size="small" label="Level Name" value={name} fullWidth
          onChange={(e) => { setName(e.target.value); setNameError(''); }}
          error={!!nameError} helperText={nameError}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
        <Button variant="contained" onClick={handleAdd} disabled={isSaving}
          sx={{ minWidth: 90, flexShrink: 0, height: 40 }}
          startIcon={isSaving ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}>
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
      ) : levels.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Existing Levels</Typography>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Table size="small" stickyHeader>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 96 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {levels.map((level) => (
                  <TableRow key={level.id} hover>
                    <TableCell>
                      {editingId === level.id ? (
                        <TextField size="small" value={editName} autoFocus fullWidth
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()} />
                      ) : level.name}
                    </TableCell>
                    <TableCell align="right">
                      {editingId === level.id ? (
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <IconButton size="small" color="success" onClick={handleSaveEdit} disabled={isUpdating}>
                            {isUpdating ? <CircularProgress size={14} /> : <CheckIcon fontSize="small" />}
                          </IconButton>
                          <IconButton size="small" onClick={() => setEditingId(null)}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <IconButton size="small" color="primary"
                            onClick={() => { setEditingId(level.id); setEditName(level.name); }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => setDeleteTargetId(level.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
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
      title="Level Management"
      extras={
        <DeleteConfirmDialog
          open={deleteTargetId !== null}
          onClose={() => setDeleteTargetId(null)}
          onConfirm={() => deleteLevel(deleteTargetId!, { onSuccess: () => setDeleteTargetId(null) })}
          isDeleting={isDeleting}
          title="Delete Level"
        />
      }
    >
      {formSection}
      {listSection}
    </ManagedItemDialog>
  );
};
