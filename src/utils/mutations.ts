import { useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';

export const useManagedMutation = <TData = unknown, TVariables = void>(
  mutationFn: (vars: TVariables) => Promise<TData>,
  invalidateKeys: readonly (readonly unknown[])[],
  messages: { success: string; error: string },
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      invalidateKeys.forEach(k => qc.invalidateQueries({ queryKey: k as unknown[] }));
      enqueueSnackbar(messages.success, { variant: 'success' });
    },
    onError: () => enqueueSnackbar(messages.error, { variant: 'error' }),
  });
};
