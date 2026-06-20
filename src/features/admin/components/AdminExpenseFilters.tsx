import {
  Box, Grid, Typography, Select, MenuItem, Button, TextField, ListSubheader,
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { EXPENSE_STATUSES } from '../../../constants/masterData';
import { useExpenseTypes } from '../../expenses/hooks/useMasterData';
import { useEmployees } from '../hooks/useAdminMaster';
import type { AdminExpenseFilters as IFilters } from '../../../types/expense.types';

interface Props {
  onFilter: (filters: IFilters) => void;
  title?: string;
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

export const AdminExpenseFilters = ({ onFilter, title = 'Expense Filter' }: Props) => {
  const [employeeId, setEmployeeId] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [expenseType, setExpenseType] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [status, setStatus] = useState('');

  const { data: expenseTypes = [] } = useExpenseTypes();
  const { data: employees = [] } = useEmployees();

  const filteredEmployees = useMemo(
    () => employees.filter(e => e.name.toLowerCase().includes(employeeSearch.toLowerCase())),
    [employees, employeeSearch]
  );

  const handleFetch = () => onFilter({ employee: employeeId, expenseType, fromDate, toDate, status });
  const handleReset = () => {
    setEmployeeId(''); setEmployeeSearch(''); setExpenseType('');
    setFromDate(''); setToDate(''); setStatus('');
    onFilter({});
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>{title}</Typography>
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
            <Typography variant="caption" sx={{ fontWeight: 500, mb: 0.5, display: 'block' }}>Employee</Typography>
            <Select
              fullWidth
              size="small"
              value={employeeId}
              onChange={(e) => setEmployeeId(String(e.target.value))}
              onClose={() => setEmployeeSearch('')}
              displayEmpty
              sx={selectSx}
              MenuProps={{ autoFocus: false, slotProps: { paper: { sx: { maxHeight: 300 } } } }}
            >
              {/* Sticky search inside dropdown */}
              <ListSubheader sx={{ px: 1, py: 0.75, lineHeight: 'normal', bgcolor: 'background.paper' }}>
                <TextField
                  size="small"
                  fullWidth
                  autoFocus
                  placeholder="Search employee..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  sx={inputSx}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </ListSubheader>
              <MenuItem value="">All Employees</MenuItem>
              {filteredEmployees.length === 0
                ? <MenuItem disabled><em>No results</em></MenuItem>
                : filteredEmployees.map(e => (
                    <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>
                  ))}
            </Select>
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
                <MenuItem key={t.id} value={String(t.id)}>{t.name}</MenuItem>
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
