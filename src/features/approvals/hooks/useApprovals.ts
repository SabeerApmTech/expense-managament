import { useQuery } from '@tanstack/react-query';
import { approvalsApi } from '../../../api/approvals.api';
import { useManagedMutation } from '../../../utils/mutations';
import type { UpdateApprovalStatus } from '../../../types/approval.types';

export const APPROVAL_KEYS = {
  all: ['approvals'] as const,
  list: (empId: string) => [...APPROVAL_KEYS.all, 'list', empId] as const,
};

export const useApprovalEmployeeExpenses = (empId: string) =>
  useQuery({
    queryKey: APPROVAL_KEYS.list(empId),
    queryFn: () => approvalsApi.getEmployeeExpenses(empId),
    enabled: !!empId,
  });

export const useUpdateApproval = (empId: string) =>
  useManagedMutation(
    (vars: { approvalId: number; status: UpdateApprovalStatus; rejectedReason?: string }) =>
      approvalsApi.updateApproval(vars.approvalId, vars.status, empId, vars.rejectedReason),
    [APPROVAL_KEYS.list(empId)],
    { success: (result) => result.message ?? 'Updated successfully', error: 'Failed to update' }
  );
