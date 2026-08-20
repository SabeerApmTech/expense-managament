import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { getErrorMessage } from './apiEnvelope';

type MessageOrFn<T> = string | ((result: T) => string);

export const useManagedMutation = <TData = unknown, TVariables = void>(
  mutationFn: (vars: TVariables) => Promise<TData>,
  invalidateKeys: readonly (readonly unknown[])[],
  messages: { success: MessageOrFn<TData>; error: string },
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      invalidateKeys.forEach(k => qc.invalidateQueries({ queryKey: k as unknown[] }));
      const successMessage = typeof messages.success === 'function' ? messages.success(data) : messages.success;
      enqueueSnackbar(successMessage, { variant: 'success' });
    },
    onError: (error) => enqueueSnackbar(getErrorMessage(error, messages.error), { variant: 'error' }),
  });
};
