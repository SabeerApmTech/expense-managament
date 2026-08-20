import { useMutation } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { authApi } from '../../../api/auth.api';
import { getErrorMessage } from '../../../utils/apiEnvelope';

export const useResetPassword = () =>
  useMutation({
    mutationFn: (empId: string) => authApi.resetPassword(empId),
    onSuccess: ({ message }) => {
      enqueueSnackbar(message ?? 'Password reset successfully', { variant: 'success' });
    },
    onError: (error) => {
      enqueueSnackbar(getErrorMessage(error, 'Failed to reset password'), { variant: 'error' });
    },
  });
