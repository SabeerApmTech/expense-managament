import {
  Button, TextField, Box, Typography, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton,
  FormControl, Select, MenuItem, FormHelperText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';
import { ManagedItemDialog } from '../../../components/common/ManagedItemDialog';
import { DeleteConfirmDialog } from '../../../components/common/DeleteConfirmDialog';
import {
  useActiveAssetTypes, useActiveAssetNames, useCreateAssetName, useDeleteAssetName,
} from '../hooks/useAssets';

interface Props {
  open: boolean;
  onClose: () => void;
  empId: string;
}

// Only active asset names can be listed at all (the API has no "all names" endpoint,
// only "active names for a type") — so, like asset types, deactivating one here also
// removes it from view; delete is the only way to fully retire a mistaken entry.
export const AssetNameManagementDialog = ({ open, onClose, empId }: Props) => {
  const [assetTypeId, setAssetTypeId] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [typeError, setTypeError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

  const { data: assetTypes = [] } = useActiveAssetTypes();
  const { data: assetNames = [], isLoading } = useActiveAssetNames(assetTypeId || undefined);
  const { mutate: create, isPending: creating } = useCreateAssetName(empId);
  const { mutate: remove, isPending: deleting } = useDeleteAssetName(empId);

  const handleSave = () => {
    const missingType = !assetTypeId;
    const missingName = !name.trim();
    setTypeError(missingType ? 'Select an asset type first' : '');
    setNameError(missingName ? 'Name is required' : '');
    if (missingType || missingName) return;
    create(
      { assetTypeId: assetTypeId as number, assetName: name.trim() },
      { onSuccess: () => { setName(''); setNameError(''); } }
    );
  };

  return (
    <ManagedItemDialog
      open={open} onClose={onClose}
      title="Asset Names"
      extras={
        <DeleteConfirmDialog
          open={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => { if (deleteConfirm) remove(deleteConfirm.id, { onSuccess: () => setDeleteConfirm(null) }); }}
          isDeleting={deleting}
          title="Delete Asset Name"
          message={deleteConfirm ? <>Delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</> : undefined}
        />
      }
    >
      <Box sx={{ px: 3, pt: 2, pb: 2, flexShrink: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Add New</Typography>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <FormControl size="small" error={!!typeError} sx={{ minWidth: 180 }}>
            <Select
              value={assetTypeId}
              onChange={(e) => { setAssetTypeId(e.target.value as number); setTypeError(''); }}
              displayEmpty
            >
              <MenuItem value=""><em>Select Asset Type</em></MenuItem>
              {assetTypes.map((t) => (
                <MenuItem key={t.assetTypeId} value={t.assetTypeId}>{t.assetTypeName}</MenuItem>
              ))}
            </Select>
            {typeError && <FormHelperText>{typeError}</FormHelperText>}
          </FormControl>
          <TextField
            size="small" label="Asset Name" value={name} sx={{ minWidth: 180 }}
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
        {!assetTypeId ? (
          <Typography variant="caption" color="text.secondary">Select an asset type above to view its names</Typography>
        ) : isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
            <CircularProgress size={32} />
          </Box>
        ) : assetNames.length === 0 ? (
          <Typography variant="caption" color="text.secondary">No asset names added yet for this type</Typography>
        ) : (
          <Table size="small" stickyHeader sx={{ minWidth: 300 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assetNames.map((n) => (
                <TableRow key={n.assetNameId} hover>
                  <TableCell>{n.assetName}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <IconButton size="small" color="error" onClick={() => setDeleteConfirm({ id: n.assetNameId, name: n.assetName })}>
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
