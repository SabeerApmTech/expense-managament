import {
  Box, Paper, Typography, FormControl, Select, MenuItem, Grid,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useMemo, useState } from 'react';
import { LoadingState } from '../../../components/common/LoadingState';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { ExpenseTypeYearCard } from '../components/ExpenseTypeYearCard';
import { useYearlyUsage } from '../hooks/useAccounts';
import { useAuthContext } from '../../../store/authStore';
import { formatCurrency } from '../../../utils/formatters';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

export const UsagesPage = () => {
  const { user } = useAuthContext();
  const [year, setYear] = useState(CURRENT_YEAR);
  const { data, isLoading, isError, refetch } = useYearlyUsage(user?.empId, year);

  const expenseTypes = useMemo(() => data?.employees[0]?.expenseTypes ?? [], [data]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>My Usage</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {YEAR_OPTIONS.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>
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

          {expenseTypes.length === 0 ? (
            <EmptyState />
          ) : (
            <Grid container spacing={2}>
              {expenseTypes.map((t) => (
                <Grid key={t.expenseTypeId} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <ExpenseTypeYearCard expenseType={t} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};
