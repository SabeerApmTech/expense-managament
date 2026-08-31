import { useQuery } from '@tanstack/react-query';
import { officeApi } from '../../../api/office.api';
import { useManagedMutation } from '../../../utils/mutations';
import type { CreateOfficePayload, EditOfficePayload } from '../../../types/office.types';

export const OFFICE_KEYS = {
  all: ['offices'] as const,
};

export const useOffices = () =>
  useQuery({
    queryKey: OFFICE_KEYS.all,
    queryFn: () => officeApi.getAll(),
  });

export const useCreateOffice = () =>
  useManagedMutation(
    (payload: CreateOfficePayload) => officeApi.create(payload),
    [OFFICE_KEYS.all],
    { success: (result) => result.message ?? 'Office created successfully', error: 'Failed to create office' }
  );

export const useEditOffice = () =>
  useManagedMutation(
    (vars: { officeId: number; payload: EditOfficePayload }) => officeApi.edit(vars.officeId, vars.payload),
    [OFFICE_KEYS.all],
    { success: (result) => result.message ?? 'Office updated successfully', error: 'Failed to update office' }
  );
