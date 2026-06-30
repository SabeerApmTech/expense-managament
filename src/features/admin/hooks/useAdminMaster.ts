import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../api/admin.api';
import { MASTER_KEYS } from '../../expenses/hooks/useMasterData';
import { useManagedMutation } from '../../../utils/mutations';

const ADMIN_MASTER_KEYS = {
  designations: ['designations'] as const,
  designationExpenseMaps: ['designation-expense-maps'] as const,
  designationTravelMaps: ['designation-travel-maps'] as const,
  levels: ['levels'] as const,
  expenseLevelMaps: ['expense-level-maps'] as const,
  employees: ['employees'] as const,
  employeeLevelMaps: ['employee-level-maps'] as const,
  designationLevelMaps: ['designation-level-maps'] as const,
  dashboard: ['dashboard'] as const,
  approvalLimits: ['approval-limits'] as const,
};

// ─── Designation ─────────────────────────────────────────────────────────────

export const useDesignations = () =>
  useQuery({
    queryKey: ADMIN_MASTER_KEYS.designations,
    queryFn: adminApi.getDesignations,
    staleTime: 10 * 60 * 1000,
  });

export const useDesignationExpenseMaps = () =>
  useQuery({
    queryKey: ADMIN_MASTER_KEYS.designationExpenseMaps,
    queryFn: adminApi.getDesignationExpenseMaps,
  });

export const useSaveDesignationExpenseMap = () =>
  useManagedMutation(
    adminApi.saveDesignationExpenseMap,
    [ADMIN_MASTER_KEYS.designationExpenseMaps],
    { success: 'Saved successfully', error: 'Failed to save' },
  );

export const useDeleteDesignationExpenseMap = () =>
  useManagedMutation(
    adminApi.deleteDesignationExpenseMap,
    [ADMIN_MASTER_KEYS.designationExpenseMaps],
    { success: 'Deleted successfully', error: 'Failed to delete' },
  );

export const useDesignationTravelMaps = () =>
  useQuery({
    queryKey: ADMIN_MASTER_KEYS.designationTravelMaps,
    queryFn: adminApi.getDesignationTravelMaps,
  });

export const useSaveDesignationTravelMap = () =>
  useManagedMutation(
    adminApi.saveDesignationTravelMap,
    [ADMIN_MASTER_KEYS.designationTravelMaps],
    { success: 'Saved successfully', error: 'Failed to save' },
  );

export const useDeleteDesignationTravelMap = () =>
  useManagedMutation(
    adminApi.deleteDesignationTravelMap,
    [ADMIN_MASTER_KEYS.designationTravelMaps],
    { success: 'Deleted successfully', error: 'Failed to delete' },
  );

export const useSaveTravelPayMode = () =>
  useManagedMutation(
    adminApi.saveTravelPayMode,
    [MASTER_KEYS.travelModes, MASTER_KEYS.payModes],
    { success: 'Saved successfully', error: 'Failed to save' },
  );

// ─── Levels ──────────────────────────────────────────────────────────────────

export const useLevels = () =>
  useQuery({
    queryKey: ADMIN_MASTER_KEYS.levels,
    queryFn: adminApi.getLevels,
  });

export const useSaveLevel = () =>
  useManagedMutation(
    adminApi.saveLevel,
    [ADMIN_MASTER_KEYS.levels],
    { success: 'Level created', error: 'Failed to create level' },
  );

export const useUpdateLevel = () =>
  useManagedMutation(
    adminApi.updateLevel,
    [ADMIN_MASTER_KEYS.levels],
    { success: 'Level updated', error: 'Failed to update level' },
  );

export const useDeleteLevel = () =>
  useManagedMutation(
    adminApi.deleteLevel,
    [
      ADMIN_MASTER_KEYS.levels,
      ADMIN_MASTER_KEYS.expenseLevelMaps,
      ADMIN_MASTER_KEYS.employeeLevelMaps,
      ADMIN_MASTER_KEYS.designationLevelMaps,
    ],
    { success: 'Level deleted', error: 'Failed to delete level' },
  );

// ─── Level ↔ Expense maps ─────────────────────────────────────────────────────

export const useExpenseLevelMaps = () =>
  useQuery({
    queryKey: ADMIN_MASTER_KEYS.expenseLevelMaps,
    queryFn: adminApi.getExpenseLevelMaps,
  });

export const useSaveExpenseLevelMap = () =>
  useManagedMutation(
    adminApi.saveExpenseLevelMap,
    [ADMIN_MASTER_KEYS.expenseLevelMaps],
    { success: 'Mapping saved', error: 'Failed to save mapping' },
  );

export const useUpdateExpenseLevelMap = () =>
  useManagedMutation(
    adminApi.updateExpenseLevelMap,
    [ADMIN_MASTER_KEYS.expenseLevelMaps],
    { success: 'Mapping updated', error: 'Failed to update mapping' },
  );

export const useDeleteExpenseLevelMap = () =>
  useManagedMutation(
    adminApi.deleteExpenseLevelMap,
    [ADMIN_MASTER_KEYS.expenseLevelMaps],
    { success: 'Mapping deleted', error: 'Failed to delete mapping' },
  );

// ─── Level ↔ Employee maps ────────────────────────────────────────────────────

export const useEmployees = () =>
  useQuery({
    queryKey: ADMIN_MASTER_KEYS.employees,
    queryFn: adminApi.getEmployees,
    staleTime: 5 * 60 * 1000,
  });

export const useEmployeeLevelMaps = () =>
  useQuery({
    queryKey: ADMIN_MASTER_KEYS.employeeLevelMaps,
    queryFn: adminApi.getEmployeeLevelMaps,
  });

export const useSaveEmployeeLevelMap = () =>
  useManagedMutation(
    adminApi.saveEmployeeLevelMap,
    [ADMIN_MASTER_KEYS.employeeLevelMaps],
    { success: 'Mapping saved', error: 'Failed to save mapping' },
  );

export const useUpdateEmployeeLevelMap = () =>
  useManagedMutation(
    adminApi.updateEmployeeLevelMap,
    [ADMIN_MASTER_KEYS.employeeLevelMaps],
    { success: 'Mapping updated', error: 'Failed to update mapping' },
  );

export const useDeleteEmployeeLevelMap = () =>
  useManagedMutation(
    adminApi.deleteEmployeeLevelMap,
    [ADMIN_MASTER_KEYS.employeeLevelMaps],
    { success: 'Mapping deleted', error: 'Failed to delete mapping' },
  );

// ─── Level ↔ Designation maps ─────────────────────────────────────────────────

export const useDesignationLevelMaps = () =>
  useQuery({
    queryKey: ADMIN_MASTER_KEYS.designationLevelMaps,
    queryFn: adminApi.getDesignationLevelMaps,
  });

export const useSaveDesignationLevelMap = () =>
  useManagedMutation(
    adminApi.saveDesignationLevelMap,
    [ADMIN_MASTER_KEYS.designationLevelMaps],
    { success: 'Mapping saved', error: 'Failed to save mapping' },
  );

export const useDeleteDesignationLevelMap = () =>
  useManagedMutation(
    adminApi.deleteDesignationLevelMap,
    [ADMIN_MASTER_KEYS.designationLevelMaps],
    { success: 'Mapping deleted', error: 'Failed to delete mapping' },
  );

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const useAdminDashboard = () =>
  useQuery({
    queryKey: ADMIN_MASTER_KEYS.dashboard,
    queryFn: adminApi.getDashboard,
    refetchInterval: 30000,
  });

// ─── Expense Type Management ──────────────────────────────────────────────────

export const useSaveExpenseType = () =>
  useManagedMutation(
    adminApi.saveExpenseType,
    [MASTER_KEYS.expenseTypes],
    { success: 'Expense type saved', error: 'Failed to save expense type' },
  );

export const useDeleteExpenseType = () =>
  useManagedMutation(
    adminApi.deleteExpenseType,
    [MASTER_KEYS.expenseTypes],
    { success: 'Expense type deleted', error: 'Failed to delete expense type' },
  );

// ─── Approval Limits ─────────────────────────────────────────────────────────

export const useApprovalLimits = () =>
  useQuery({
    queryKey: ADMIN_MASTER_KEYS.approvalLimits,
    queryFn: adminApi.getApprovalLimits,
  });

export const useSaveApprovalLimit = () =>
  useManagedMutation(
    adminApi.saveApprovalLimit,
    [ADMIN_MASTER_KEYS.approvalLimits],
    { success: 'Approval limit saved', error: 'Failed to save approval limit' },
  );

export const useDeleteApprovalLimit = () =>
  useManagedMutation(
    adminApi.deleteApprovalLimit,
    [ADMIN_MASTER_KEYS.approvalLimits],
    { success: 'Approval limit deleted', error: 'Failed to delete' },
  );

// ─── Delete Travel/Pay Mode ───────────────────────────────────────────────────

export const useDeleteTravelPayMode = () =>
  useManagedMutation(
    adminApi.deleteTravelPayMode,
    [MASTER_KEYS.travelModes, MASTER_KEYS.payModes],
    { success: 'Deleted successfully', error: 'Failed to delete' },
  );
