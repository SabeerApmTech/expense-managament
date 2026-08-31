import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid,
  FormControlLabel, Switch, CircularProgress,
} from '@mui/material';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormTextField } from '../../../components/forms/FormTextField';
import { FormDatePicker } from '../../../components/forms/FormDatePicker';
import { FormSelect } from '../../../components/forms/FormSelect';
import { userSchema, type UserFormValues } from '../schemas/user.schema';
import { useCreateUser, useEditUser, useUsers } from '../hooks/useUserManagement';
import { useOffices } from '../../offices/hooks/useOffices';
import { useAuthContext } from '../../../store/authStore';
import type { UserAccount } from '../../../types/user.types';

interface Props {
  open: boolean;
  onClose: () => void;
  editUser?: UserAccount | null;
}

const DEFAULT_VALUES: UserFormValues = {
  empId: '', empName: '', dateOfBirth: '', officeId: '', role: 'USER',
  countryCode: '+91', phoneNumber: '', isActive: true, isInitiator: false, isAccountant: false, isAssetCreator: false,
};

// Employee IDs follow "APM-000N" — suggest the next one in sequence for new users.
function nextEmpId(users: UserAccount[]): string {
  const maxNum = users.reduce((max, u) => {
    const match = /^APM-(\d+)$/.exec(u.empId);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `APM-${String(maxNum + 1).padStart(4, '0')}`;
}

export const UserFormDialog = ({ open, onClose, editUser }: Props) => {
  const { user: currentUser } = useAuthContext();
  const { data: users = [] } = useUsers();
  const { data: offices = [] } = useOffices();
  const isEdit = !!editUser;
  const { mutate: create, isPending: creating } = useCreateUser();
  const { mutate: edit, isPending: editing } = useEditUser();

  const methods = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    if (editUser) {
      methods.reset({
        ...DEFAULT_VALUES,
        empId: editUser.empId,
        empName: editUser.empName,
        dateOfBirth: editUser.dateOfBirth?.slice(0, 10) ?? '',
        officeId: editUser.officeId ? String(editUser.officeId) : '',
        role: editUser.role,
        countryCode: editUser.countryCode,
        phoneNumber: editUser.phoneNumber,
        isActive: editUser.isActive,
        isInitiator: editUser.isInitiator,
        isAccountant: editUser.isAccountant,
        isAssetCreator: editUser.isAssetCreator,
      });
    } else {
      methods.reset({ ...DEFAULT_VALUES, empId: nextEmpId(users) });
    }
  }, [open, editUser, methods, users]);

  const isPending = creating || editing;

  const onSubmit = (values: UserFormValues) => {
    if (!currentUser) return;
    if (isEdit && editUser) {
      edit(
        {
          userId: editUser.userId,
          payload: {
            empId: values.empId,
            empName: values.empName,
            dateOfBirth: values.dateOfBirth,
            officeId: Number(values.officeId),
            department: editUser.department,
            email: editUser.email,
            bloodGroup: editUser.bloodGroup,
            role: 'USER',
            countryCode: values.countryCode,
            phoneNumber: values.phoneNumber,
            isActive: values.isActive,
            isInitiator: values.isInitiator,
            isAccountant: values.isAccountant,
            isAssetCreator: values.isAssetCreator,
            updatedByEmpId: currentUser.empId,
          },
        },
        { onSuccess: onClose }
      );
    } else {
      create(
        {
          empId: values.empId,
          empName: values.empName,
          dateOfBirth: values.dateOfBirth,
          officeId: Number(values.officeId),
          role: 'USER',
          countryCode: values.countryCode,
          phoneNumber: values.phoneNumber,
          isActive: values.isActive,
          isInitiator: values.isInitiator,
          isAccountant: values.isAccountant,
          createdByEmpId: currentUser.empId,
        },
        { onSuccess: onClose }
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{isEdit ? 'Edit User' : 'Add User'}</DialogTitle>
      <FormProvider {...methods}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="empId" label="Employee ID" required disabled />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormTextField name="empName" label="Employee Name" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormDatePicker name="dateOfBirth" label="Date of Birth" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormSelect
                name="officeId"
                label="Office"
                options={offices.map((o) => ({ value: String(o.officeId), label: `${o.officeName} — ${o.city}` }))}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormTextField name="countryCode" label="Country Code" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormTextField name="phoneNumber" label="Phone Number" required />
            </Grid>
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
              <Controller
                name="isInitiator"
                control={methods.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label="Initiator (can approve expenses)"
                  />
                )}
              />
              <Controller
                name="isAccountant"
                control={methods.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label="Accountant"
                  />
                )}
              />
              <Controller
                name="isAssetCreator"
                control={methods.control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label="Asset Creator (can manage office assets)"
                  />
                )}
              />
            </Grid>
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
            {isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};
