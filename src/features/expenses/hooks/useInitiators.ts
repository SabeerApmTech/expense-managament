import { useQuery } from '@tanstack/react-query';
import { userManagementApi } from '../../../api/userManagement.api';

export const useInitiators = () =>
  useQuery({
    queryKey: ['user-management', 'initiators'],
    queryFn: async () => (await userManagementApi.getAll()).filter((u) => u.isInitiator),
    staleTime: 5 * 60 * 1000,
  });
