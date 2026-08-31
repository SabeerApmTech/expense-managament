import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import { FileUpload } from '../../../components/common/FileUpload';
import { useCreateAsset } from '../hooks/useAssets';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AssetFormDialog = ({ open, onClose }: Props) => {
  const { mutate, isPending } = useCreateAsset();
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ assetName?: string; assetType?: string; image?: string }>({});

  const resetForm = () => {
    setAssetName('');
    setAssetType('');
    setDescription('');
    setImage(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const nextErrors: typeof errors = {};
    if (!assetName.trim()) nextErrors.assetName = 'Asset name is required';
    if (!assetType.trim()) nextErrors.assetType = 'Asset type is required';
    if (!image) nextErrors.image = 'An image is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const formData = new FormData();
    formData.append('AssetName', assetName.trim());
    formData.append('AssetType', assetType.trim());
    formData.append('Image', image as File);
    if (description.trim()) formData.append('Description', description.trim());

    mutate(formData, { onSuccess: handleClose });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Add Asset</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Asset Name"
              value={assetName}
              onChange={(e) => { setAssetName(e.target.value); setErrors((p) => ({ ...p, assetName: undefined })); }}
              error={!!errors.assetName}
              helperText={errors.assetName}
              fullWidth
              size="small"
              required
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Asset Type"
              value={assetType}
              onChange={(e) => { setAssetType(e.target.value); setErrors((p) => ({ ...p, assetType: undefined })); }}
              error={!!errors.assetType}
              helperText={errors.assetType}
              fullWidth
              size="small"
              required
              placeholder="e.g. Electronics, Furniture"
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FileUpload
              value={image}
              onChange={(f) => { setImage(f); setErrors((p) => ({ ...p, image: undefined })); }}
              accept="image/*"
              label="Upload Asset Image"
              error={errors.image}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isPending}>Cancel</Button>
        <Button
          variant="contained"
          disabled={isPending}
          onClick={handleSubmit}
          startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
        >
          Add Asset
        </Button>
      </DialogActions>
    </Dialog>
  );
};
