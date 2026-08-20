import { useQuery } from '@tanstack/react-query';
import { userManagementApi } from '../../../api/userManagement.api';

// Query key shares the 'expense-type-usage' prefix with limit CRUD invalidation in
// src/features/userManagement/hooks/useUserManagement.ts — keep the literal in sync.
export const useExpenseTypeUsage = (empId: string | undefined) =>
  useQuery({
    queryKey: ['expense-type-usage', empId ?? ''],
    queryFn: () => userManagementApi.getEmpExpenseTypeUsage(empId as string),
    enabled: !!empId,
  });
