import {
  Box, Grid, Typography, Select, MenuItem, Button,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';
import dayjs from 'dayjs';
import { EXPENSE_STATUSES } from '../../../constants/masterData';
import { useExpensePageLoad } from '../hooks/useMasterData';
import { useDesignationExpenseMaps } from '../../admin/hooks/useAdminMaster';
import type { ExpenseFilters as IFilters } from '../../../types/expense.types';

interface Props {
  onFilter: (filters: IFilters) => void;
}

const inputSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#f1f3f9',
    borderRadius: 2,
    '& fieldset': { border: 'none' },
    '&.Mui-focused fieldset': { border: '1.5px solid', borderColor: 'primary.main' },
  },
};

const selectSx = {
  bgcolor: '#f1f3f9',
  borderRadius: 2,
  '& fieldset': { border: 'none' },
  '&.Mui-focused fieldset': { border: '1.5px solid', borderColor: 'primary.main' },
};

export const ExpenseFilters = ({ onFilter }: Props) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('');
  const [expenseType, setExpenseType] = useState('');

  const { data: pageLoad } = useExpensePageLoad();
  const { data: designationExpenseMaps = [] } = useDesignationExpenseMaps();

  const userDesignationId = pageLoad?.designationId;
  const userExpenseMaps = designationExpenseMaps.filter(m => m.designationId === userDesignationId);
  const mappedExpenseTypeIds = new Set(userExpenseMaps.map(m => m.expenseTypeId));

  const expenseTypes = (pageLoad?.expenseTypes ?? []).filter(t => mappedExpenseTypeIds.has(t.expenseTypeId));

  const handleFetch = () => onFilter({ fromDate, toDate, status, expenseType });
  const handleReset = () => {
    setFromDate(''); setToDate(''); setStatus(''); setExpenseType('');
    onFilter({});
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Expense Filter</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, lg: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}>From Date</Typography>
            <DatePicker
              value={fromDate ? dayjs(fromDate) : null}
              onChange={(v) => setFromDate(v ? v.format('YYYY-MM-DD') : '')}
              slotProps={{ textField: { fullWidth: true, size: 'small', sx: inputSx } }}
            />
          </Grid>
          <Grid size={{ xs: 6, lg: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}>To Date</Typography>
            <DatePicker
              value={toDate ? dayjs(toDate) : null}
              onChange={(v) => setToDate(v ? v.format('YYYY-MM-DD') : '')}
              slotProps={{ textField: { fullWidth: true, size: 'small', sx: inputSx } }}
            />
          </Grid>
          <Grid size={{ xs: 6, lg: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}>Status</Typography>
            <Select
              fullWidth
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              displayEmpty
              sx={selectSx}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {EXPENSE_STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid size={{ xs: 6, lg: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}>Expense Type</Typography>
            <Select
              fullWidth
              size="small"
              value={expenseType}
              onChange={(e) => setExpenseType(e.target.value)}
              displayEmpty
              sx={selectSx}
            >
              <MenuItem value="">All Types</MenuItem>
              {expenseTypes.map((t) => (
                <MenuItem key={t.expenseTypeId} value={String(t.expenseTypeId)}>{t.expenseTypeName}</MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 1.5 }}>
          <Button variant="outlined" size="small" onClick={handleReset} sx={{ borderRadius: 2.5, px: 2.5 }}>
            Reset
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleFetch}
            sx={{ borderRadius: 2.5, px: 3, bgcolor: '#1a3bcc', '&:hover': { bgcolor: '#1531b0' } }}
          >
            Fetch
          </Button>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};
