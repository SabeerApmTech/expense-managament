import { useMutation } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { authApi } from '../../../api/auth.api';
import { getErrorMessage } from '../../../utils/apiEnvelope';

export const useChangePassword = () =>
  useMutation({
    mutationFn: (data: { empId: string; currentPassword: string; newPassword: string }) =>
      authApi.changePassword(data.empId, data.currentPassword, data.newPassword),
    onSuccess: ({ message }) => {
      enqueueSnackbar(message ?? 'Password changed successfully', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(
        getErrorMessage(error, 'Failed to change password. Check your current password and try again.'),
        { variant: 'error' }
      );
    },
  });
