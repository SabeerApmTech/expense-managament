import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, Box,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordFormValues } from '../schemas/changePassword.schema';
import { useChangePassword } from '../hooks/useChangePassword';
import { useAuthContext } from '../../../store/authStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const ChangePasswordDialog = ({ open, onClose }: Props) => {
  const { user } = useAuthContext();
  const { mutate, isPending } = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema) });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (values: ChangePasswordFormValues) => {
    if (!user) return;
    mutate(
      { empId: user.empId, currentPassword: values.currentPassword, newPassword: values.newPassword },
      { onSuccess: handleClose }
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Change Password</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            {...register('currentPassword')}
            label="Current Password"
            type="password"
            fullWidth
            size="small"
            autoComplete="current-password"
            autoFocus
            error={!!errors.currentPassword}
            helperText={errors.currentPassword?.message}
          />
          <TextField
            {...register('newPassword')}
            label="New Password"
            type="password"
            fullWidth
            size="small"
            autoComplete="new-password"
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
          />
          <TextField
            {...register('confirmNewPassword')}
            label="Confirm New Password"
            type="password"
            fullWidth
            size="small"
            autoComplete="new-password"
            error={!!errors.confirmNewPassword}
            helperText={errors.confirmNewPassword?.message}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isPending}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isPending ? 'Saving…' : 'Change Password'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
