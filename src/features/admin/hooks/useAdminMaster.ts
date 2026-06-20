import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { adminApi } from '../../../api/admin.api';
import { MASTER_KEYS } from '../../expenses/hooks/useMasterData';

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
};

const ok = (msg: string) => enqueueSnackbar(msg, { variant: 'success' });
const err = (msg: string) => enqueueSnackbar(msg, { variant: 'error' });

// ─── Designation (existing) ──────────────────────────────────────────────────

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

export const useSaveDesignationExpenseMap = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.saveDesignationExpenseMap,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_MASTER_KEYS.designationExpenseMaps });
      ok('Saved successfully');
    },
    onError: () => err('Failed to save'),
  });
};

export const useDesignationTravelMaps = () =>
  useQuery({
    queryKey: ADMIN_MASTER_KEYS.designationTravelMaps,
    queryFn: adminApi.getDesignationTravelMaps,
  });

export const useSaveDesignationTravelMap = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.saveDesignationTravelMap,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_MASTER_KEYS.designationTravelMaps });
      ok('Saved successfully');
    },
    onError: () => err('Failed to save'),
  });
};

export const useDeleteDesignationTravelMap = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteDesignationTravelMap,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_MASTER_KEYS.designationTravelMaps });
      ok('Deleted successfully');
    },
    onError: () => err('Failed to delete'),
  });
};

export const useSaveTravelPayMode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.saveTravelPayMode,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MASTER_KEYS.travelModes });
      qc.invalidateQueries({ queryKey: MASTER_KEYS.payModes });
      ok('Saved successfully');
    },
    onError: () => err('Failed to save'),
  });
};

// ─── Levels ──────────────────────────────────────────────────────────────────

export const useLevels = () =>
  useQuery({
    queryKey: ADMIN_MASTER_KEYS.levels,
    queryFn: adminApi.getLevels,
  });

export const useSaveLevel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.saveLevel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_MASTER_KEYS.levels });
      ok('Level created');
    },
    onError: () => err('Failed to create level'),
  });
};

export const useUpdateLevel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.updateLevel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_MASTER_KEYS.levels });
      ok('Level updated');
    },
    onError: () => err('Failed to update level'),
  });
};

export const useDeleteLevel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteLevel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_MASTER_KEYS.levels });
      qc.invalidateQueries({ queryKey: ADMIN_MASTER_KEYS.expenseLevelMaps });
      qc.invalidateQueries({ queryKey: ADMIN_MASTER_KEYS.employeeLevelMaps });
      qc.invalidateQueries({ queryKey: ADMIN_MASTER_KEYS.designationLevelMaps });
      ok('Level deleted');
    },
    onError: () => err('Failed to delete level'),
  });
};

// ─── Level ↔ Expense maps ─────────────────────────────────────────────────────

export const useExpenseLevelMaps = () =>
  useQuery({
    queryKey: ADMIN_MASTER_KEYS.expenseLevelMaps,
    queryFn: adminApi.getExpenseLevelMaps,
  });

export const useSaveExpenseLevelMap = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.saveExpenseLevelMap,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_MASTER_KEYS.expenseLevelMaps });
      ok('Mapping saved');
    },
    onError: () => err('Failed to save mapping'),
  });
};

export const useUpdateExpenseLevelMap = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.updateExpenseLevelMap,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_MASTER_KEYS.expenseLevelMaps });
      ok('Mapping updated');
    },
    onError: () => err('Failed to update mapping'),
  });
};

export const useDeleteExpenseLevelMap = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteExpenseLevelMap,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_MASTER_KEYS.expenseLevelMaps });
      ok('Mapping deleted');
    },
    onError: () => err('Failed to delete mapping'),
  });
};

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

export const useSaveEmployeeLevelMap = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.saveEmployeeLevelMap,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_MASTER_KEYS.employeeLevelMaps });
      ok('Mapping saved');
    },
    onError: () => err('Failed to save mapping'),
  });
};

export const useUpdateEmployeeLevelMap = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.updateEmployeeLevelMap,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_MASTER_KEYS.employeeLevelMaps });
      ok('Mapping updated');
    },
    onError: () => err('Failed to update mapping'),
  });
};

export const useDeleteEmployeeLevelMap = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteEmployeeLevelMap,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_MASTER_KEYS.employeeLevelMaps });
      ok('Mapping deleted');
    },
    onError: () => err('Failed to delete mapping'),
  });
};

// ─── Level ↔ Designation maps ─────────────────────────────────────────────────

export const useDesignationLevelMaps = () =>
  useQuery({
    queryKey: ADMIN_MASTER_KEYS.designationLevelMaps,
    queryFn: adminApi.getDesignationLevelMaps,
  });

export const useSaveDesignationLevelMap = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.saveDesignationLevelMap,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_MASTER_KEYS.designationLevelMaps });
      ok('Mapping saved');
    },
    onError: () => err('Failed to save mapping'),
  });
};

export const useDeleteDesignationLevelMap = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteDesignationLevelMap,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_MASTER_KEYS.designationLevelMaps });
      ok('Mapping deleted');
    },
    onError: () => err('Failed to delete mapping'),
  });
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const useAdminDashboard = () =>
  useQuery({
    queryKey: ADMIN_MASTER_KEYS.dashboard,
    queryFn: adminApi.getDashboard,
    refetchInterval: 30000,
  });

// ─── Expense Type Management ──────────────────────────────────────────────────

export const useSaveExpenseType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.saveExpenseType,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MASTER_KEYS.expenseTypes });
      ok('Expense type saved');
    },
    onError: () => err('Failed to save expense type'),
  });
};

export const useDeleteExpenseType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteExpenseType,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MASTER_KEYS.expenseTypes });
      ok('Expense type deleted');
    },
    onError: () => err('Failed to delete expense type'),
  });
};

// ─── Delete Travel/Pay Mode ───────────────────────────────────────────────────

export const useDeleteTravelPayMode = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: adminApi.deleteTravelPayMode,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MASTER_KEYS.travelModes });
      qc.invalidateQueries({ queryKey: MASTER_KEYS.payModes });
      ok('Deleted successfully');
    },
    onError: () => err('Failed to delete'),
  });
};
