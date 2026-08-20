import { Box, Chip, FormControl, Select, MenuItem } from '@mui/material';
import { useMemo, useState } from 'react';
import { DataTable } from '../../../components/common/DataTable';
import { useAllEmpExpenseTypeUsage } from '../hooks/useUserManagement';
import { useAuthContext } from '../../../store/authStore';
import { formatCurrency } from '../../../utils/formatters';
import type { EmployeeExpenseTypeUsage } from '../../../types/user.types';
import type { Column } from '../../../types/common.types';

export const EmployeeExpenseUsagePage = () => {
  const { user: currentUser } = useAuthContext();
  const { data = [], isLoading, isError, refetch } = useAllEmpExpenseTypeUsage(currentUser?.empId ?? null);
  const [selectedEmpId, setSelectedEmpId] = useState('');

  const employees = useMemo(() => {
    const seen = new Map<string, string>();
    data.forEach((d) => { if (!seen.has(d.empId)) seen.set(d.empId, d.empName); });
    return Array.from(seen, ([empId, empName]) => ({ empId, empName }));
  }, [data]);

  const rows = selectedEmpId ? data.filter((d) => d.empId === selectedEmpId) : data;

  const columns: Column<EmployeeExpenseTypeUsage>[] = [
    { id: 'empName', label: 'Employee', minWidth: 140, sortable: true },
    { id: 'expenseTypeName', label: 'Expense Type', minWidth: 130, sortable: true },
    { id: 'expenseCategory', label: 'Category', minWidth: 100, render: (v) => <Chip size="small" label={String(v)} variant="outlined" /> },
    { id: 'limitAmount', label: 'Limit', minWidth: 110, render: (v) => formatCurrency(Number(v || 0)) },
    { id: 'spentThisMonth', label: 'Spent', minWidth: 110, render: (v) => formatCurrency(Number(v || 0)) },
    {
      id: 'remainingAmount', label: 'Remaining', minWidth: 120,
      render: (v) => {
        const remaining = Number(v || 0);
        return (
          <Chip
            size="small"
            label={formatCurrency(remaining)}
            color={remaining <= 0 ? 'error' : 'success'}
            variant="outlined"
          />
        );
      },
    },
  ];

  return (
    <Box>
      <DataTable<EmployeeExpenseTypeUsage & Record<string, unknown>>
        columns={columns as Column<EmployeeExpenseTypeUsage & Record<string, unknown>>[]}
        rows={rows as (EmployeeExpenseTypeUsage & Record<string, unknown>)[]}
        loading={isLoading}
        error={isError}
        onRetry={refetch}
        rowKey="userExpenseTypeId"
        title="Employee Expense Usage — This Month"
        searchPlaceholder="Search employees..."
        showSerialNo
        toolbarExtra={
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)} displayEmpty>
              <MenuItem value=""><em>All Employees</em></MenuItem>
              {employees.map((e) => (
                <MenuItem key={e.empId} value={e.empId}>{e.empName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        }
      />
    </Box>
  );
};
