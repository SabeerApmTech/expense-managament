import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../../api/auth.api';
import { useAuthContext } from '../../../store/authStore';
import { getErrorMessage } from '../../../utils/apiEnvelope';
import type { LoginRequest } from '../../../types/auth.types';
import { getHomeRoute } from '../../../utils/routing';

export const useLogin = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data.empId, data.password),
    onSuccess: ({ data: user, message }) => {
      queryClient.clear();
      login(user);
      enqueueSnackbar(message ?? `Welcome, ${user.empName}!`, { variant: 'success' });
      navigate(getHomeRoute(user.role));
    },
    onError: (error) => {
      enqueueSnackbar(getErrorMessage(error, 'Invalid credentials. Please try again.'), { variant: 'error' });
    },
  });
};
