import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../api/auth.api';
import { useAuthContext } from '../../../store/authStore';
import type { LoginRequest } from '../../../types/auth.types';
import { ROUTES } from '../../../constants/masterData';

export const useLogin = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: ({ user, token }) => {
      queryClient.clear();
      login(user, token);
      enqueueSnackbar(`Welcome, ${user.name}!`, { variant: 'success' });
      if (user.role === 'USER') {
        navigate(ROUTES.USER.EXPENSES);
      } else {
        navigate(ROUTES.ADMIN.APPROVALS);
      }
    },
    onError: () => {
      enqueueSnackbar('Invalid credentials. Please try again.', { variant: 'error' });
    },
  });
};
