import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, CircularProgress,
  FormControl, Select, MenuItem, FormHelperText, ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import { useState } from 'react';
import { FileUpload } from '../../../components/common/FileUpload';
import { useActiveAssetTypes, useActiveAssetNames, useAssetEmployees, useCreateAsset } from '../hooks/useAssets';
import type { AssetAssignmentType } from '../../../types/asset.types';

interface Props {
  open: boolean;
  onClose: () => void;
  empId: string;
}

interface FormErrors {
  assetTypeId?: string;
  assetNameId?: string;
  assignedEmpId?: string;
  image?: string;
}

export const AssetFormDialog = ({ open, onClose, empId }: Props) => {
  const { mutate, isPending } = useCreateAsset(empId);
  const { data: assetTypes = [] } = useActiveAssetTypes();

  const [assetTypeId, setAssetTypeId] = useState<number | ''>('');
  const [assetNameId, setAssetNameId] = useState<number | ''>('');
  const [assignmentType, setAssignmentType] = useState<AssetAssignmentType>('OFFICE');
  const [assignedEmpId, setAssignedEmpId] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const { data: assetNames = [] } = useActiveAssetNames(assetTypeId || undefined);
  const { data: employees = [] } = useAssetEmployees(assignmentType === 'EMPLOYEE' ? empId : undefined);

  const resetForm = () => {
    setAssetTypeId('');
    setAssetNameId('');
    setAssignmentType('OFFICE');
    setAssignedEmpId('');
    setDescription('');
    setImage(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const nextErrors: FormErrors = {};
    if (!assetTypeId) nextErrors.assetTypeId = 'Asset type is required';
    if (!assetNameId) nextErrors.assetNameId = 'Asset name is required';
    if (assignmentType === 'EMPLOYEE' && !assignedEmpId) nextErrors.assignedEmpId = 'Employee is required';
    if (!image) nextErrors.image = 'An image is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const formData = new FormData();
    formData.append('AssetNameId', String(assetNameId));
    formData.append('AssignmentType', assignmentType);
    if (assignmentType === 'EMPLOYEE') formData.append('EmpId', assignedEmpId);
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
            <FormControl size="small" fullWidth error={!!errors.assetTypeId}>
              <Select
                value={assetTypeId}
                onChange={(e) => {
                  setAssetTypeId(e.target.value as number);
                  setAssetNameId('');
                  setErrors((p) => ({ ...p, assetTypeId: undefined }));
                }}
                displayEmpty
              >
                <MenuItem value=""><em>Select Asset Type</em></MenuItem>
                {assetTypes.map((t) => (
                  <MenuItem key={t.assetTypeId} value={t.assetTypeId}>{t.assetTypeName}</MenuItem>
                ))}
              </Select>
              {errors.assetTypeId && <FormHelperText>{errors.assetTypeId}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl size="small" fullWidth disabled={!assetTypeId} error={!!errors.assetNameId}>
              <Select
                value={assetNameId}
                onChange={(e) => { setAssetNameId(e.target.value as number); setErrors((p) => ({ ...p, assetNameId: undefined })); }}
                displayEmpty
              >
                <MenuItem value=""><em>Select Asset Name</em></MenuItem>
                {assetNames.map((n) => (
                  <MenuItem key={n.assetNameId} value={n.assetNameId}>{n.assetName}</MenuItem>
                ))}
              </Select>
              {errors.assetNameId && <FormHelperText>{errors.assetNameId}</FormHelperText>}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ToggleButtonGroup
              size="small"
              exclusive
              fullWidth
              value={assignmentType}
              onChange={(_e, v) => { if (v) { setAssignmentType(v); setAssignedEmpId(''); } }}
            >
              <ToggleButton value="OFFICE">Office Asset</ToggleButton>
              <ToggleButton value="EMPLOYEE">Assign to Employee</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          {assignmentType === 'EMPLOYEE' && (
            <Grid size={{ xs: 12 }}>
              <FormControl size="small" fullWidth error={!!errors.assignedEmpId}>
                <Select
                  value={assignedEmpId}
                  onChange={(e) => { setAssignedEmpId(e.target.value); setErrors((p) => ({ ...p, assignedEmpId: undefined })); }}
                  displayEmpty
                >
                  <MenuItem value=""><em>Select Employee</em></MenuItem>
                  {employees.map((e) => (
                    <MenuItem key={e.empId} value={e.empId}>{e.empName}</MenuItem>
                  ))}
                </Select>
                {errors.assignedEmpId && <FormHelperText>{errors.assignedEmpId}</FormHelperText>}
              </FormControl>
            </Grid>
          )}
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
          startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Add Asset
        </Button>
      </DialogActions>
    </Dialog>
  );
};
