import {
  Box, Paper, Typography, FormControl, Select, MenuItem, TextField, InputAdornment,
  IconButton, Collapse, Grid, Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useMemo, useState } from 'react';
import { LoadingState } from '../../../components/common/LoadingState';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { ExpenseTypeYearCard } from '../../accounts/components/ExpenseTypeYearCard';
import { useYearlyUsage } from '../../accounts/hooks/useAccounts';
import { useAuthContext } from '../../../store/authStore';
import { formatCurrency } from '../../../utils/formatters';
import type { YearlyUsageEmployee } from '../../../types/accounts.types';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

function EmployeeYearRow({ employee }: { employee: YearlyUsageEmployee }) {
  const [open, setOpen] = useState(false);
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, mb: 1.5, overflow: 'hidden' }}>
      <Box
        onClick={() => setOpen((o) => !o)}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <IconButton size="small" sx={{ pointerEvents: 'none' }}>
          {open ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
        </IconButton>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, flex: 1 }}>{employee.empName}</Typography>
        <Chip
          size="small"
          label={formatCurrency(employee.totalYearlyAmount)}
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 700 }}
        />
      </Box>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ px: 2, pb: 2, pt: 0.5, bgcolor: 'action.hover' }}>
          {employee.expenseTypes.length === 0 ? (
            <Typography variant="caption" color="text.secondary">No expense usage this year</Typography>
          ) : (
            <Grid container spacing={1.5}>
              {employee.expenseTypes.map((t) => (
                <Grid key={t.expenseTypeId} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <ExpenseTypeYearCard expenseType={t} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

export const EmployeeExpenseUsagePage = () => {
  const { user: currentUser } = useAuthContext();
  const [year, setYear] = useState(CURRENT_YEAR);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useYearlyUsage(currentUser?.empId, year);
  const employees = useMemo(() => data?.employees ?? [], [data]);

  const employeeOptions = useMemo(
    () => employees.map((e) => ({ empId: e.empId, empName: e.empName })),
    [employees]
  );

  const filtered = useMemo(() => {
    let rows = selectedEmpId ? employees.filter((e) => e.empId === selectedEmpId) : employees;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((e) => e.empName.toLowerCase().includes(q));
    }
    return rows;
  }, [employees, selectedEmpId, search]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Employee Expense Usage — {year}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 220 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)} displayEmpty>
              <MenuItem value=""><em>All Employees</em></MenuItem>
              {employeeOptions.map((e) => (
                <MenuItem key={e.empId} value={e.empId}>{e.empName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {YEAR_OPTIONS.map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <>
          <Paper
            variant="outlined"
            sx={{
              px: 3, py: 2.5, mb: 2.5, borderRadius: 2.5,
              background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'primary.contrastText',
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>Total Settled — {year}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{formatCurrency(data?.totalYearlyAmount ?? 0)}</Typography>
          </Paper>

          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((e) => <EmployeeYearRow key={e.empId} employee={e} />)
          )}
        </>
      )}
    </Box>
  );
};
