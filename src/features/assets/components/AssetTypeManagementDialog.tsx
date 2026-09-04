import {
  Button, TextField, Box, Typography, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton, Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { ManagedItemDialog } from '../../../components/common/ManagedItemDialog';
import { DeleteConfirmDialog } from '../../../components/common/DeleteConfirmDialog';
import { useAssetTypes, useCreateAssetType, useUpdateAssetType, useDeleteAssetType } from '../hooks/useAssets';

interface Props {
  open: boolean;
  onClose: () => void;
  empId: string;
}

export const AssetTypeManagementDialog = ({ open, onClose, empId }: Props) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  const { data: assetTypes = [], isLoading } = useAssetTypes();
  const { mutate: create, isPending: creating } = useCreateAssetType(empId);
  const { mutate: update, isPending: updating } = useUpdateAssetType(empId);
  const { mutate: remove, isPending: deleting } = useDeleteAssetType(empId);

  const handleSave = () => {
    if (!name.trim()) { setNameError('Name is required'); return; }
    create({ assetTypeName: name.trim() }, { onSuccess: () => { setName(''); setNameError(''); } });
  };

  return (
    <ManagedItemDialog
      open={open} onClose={onClose}
      title="Asset Types"
      extras={
        <DeleteConfirmDialog
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => { if (deleteConfirm) remove(deleteConfirm.id, { onSuccess: () => setDeleteConfirm(null) }); }}
          isDeleting={deleting}
          title="Delete Asset Type"
          message={deleteConfirm ? <>Delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</> : undefined}
        />
      }
    >
      <Box sx={{ px: 3, pt: 2, pb: 2, flexShrink: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Add New</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <TextField
            size="small" label="Asset Type Name" value={name} sx={{ minWidth: 220 }}
            onChange={(e) => { setName(e.target.value); setNameError(''); }}
            error={!!nameError} helperText={nameError}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <Button variant="contained" onClick={handleSave} disabled={creating}
            sx={{ minWidth: 90, flexShrink: 0, height: 40 }}
            startIcon={creating ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}>
            Add
          </Button>
        </Box>
      </Box>

      <Box sx={{ px: 3, pb: 2 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
            <CircularProgress size={32} />
          </Box>
        ) : assetTypes.length === 0 ? (
          <Typography variant="caption" color="text.secondary">No asset types added yet</Typography>
        ) : (
          <Table size="small" stickyHeader sx={{ minWidth: 300 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assetTypes.map((t) => (
                <TableRow key={t.assetTypeId} hover>
                  <TableCell>{t.assetTypeName}</TableCell>
                  <TableCell>
                    <Switch
                      size="small"
                      checked={t.isActive}
                      disabled={updating}
                      onChange={(e) => update({ assetTypeId: t.assetTypeId, payload: { assetTypeName: t.assetTypeName, isActive: e.target.checked } })}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton size="small" color="error" onClick={() => setDeleteConfirm({ id: t.assetTypeId, name: t.assetTypeName })}>
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
