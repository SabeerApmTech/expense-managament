import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid,
  FormControlLabel, Switch, CircularProgress,
} from '@mui/material';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormTextField } from '../../../components/forms/FormTextField';
import { officeSchema, type OfficeFormValues } from '../schemas/office.schema';
import { useCreateOffice, useEditOffice } from '../hooks/useOffices';
import type { Office } from '../../../types/office.types';

interface Props {
  open: boolean;
  onClose: () => void;
  editOffice?: Office | null;
}

const DEFAULT_VALUES: OfficeFormValues = {
  officeName: '', address: '', city: '', state: '', country: '', pincode: '', isActive: true,
};

export const OfficeFormDialog = ({ open, onClose, editOffice }: Props) => {
  const isEdit = !!editOffice;
  const { mutate: create, isPending: creating } = useCreateOffice();
  const { mutate: edit, isPending: editing } = useEditOffice();

  const methods = useForm<OfficeFormValues>({
    resolver: zodResolver(officeSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    if (editOffice) {
      methods.reset({
        officeName: editOffice.officeName,
        address: editOffice.address,
        city: editOffice.city,
        state: editOffice.state,
        country: editOffice.country,
        pincode: editOffice.pincode,
        isActive: editOffice.isActive,
      });
    } else {
      methods.reset(DEFAULT_VALUES);
    }
  }, [open, editOffice, methods]);

  const isPending = creating || editing;

  const onSubmit = (values: OfficeFormValues) => {
    if (isEdit && editOffice) {
      edit({ officeId: editOffice.officeId, payload: values }, { onSuccess: onClose });
    } else {
      const { officeName, address, city, state, country, pincode } = values;
      create({ officeName, address, city, state, country, pincode }, { onSuccess: onClose });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{isEdit ? 'Edit Office' : 'Add Office'}</DialogTitle>
      <FormProvider {...methods}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="officeName" label="Office Name" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="pincode" label="Pincode" required />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormTextField name="address" label="Address" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormTextField name="city" label="City" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormTextField name="state" label="State" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormTextField name="country" label="Country" required />
            </Grid>
            {isEdit && (
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="isActive"
                  control={methods.control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                      label="Active"
                    />
                  )}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button
            variant="contained"
            disabled={isPending}
            onClick={methods.handleSubmit(onSubmit)}
            startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isEdit ? 'Save Changes' : 'Create Office'}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};
