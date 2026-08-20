import {
  Box, Paper, Typography, FormControl, Select, MenuItem, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse, IconButton,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { LoadingState } from '../../../components/common/LoadingState';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { useSettlementReport } from '../hooks/useAccounts';
import { useAuthContext } from '../../../store/authStore';
import { formatCurrency } from '../../../utils/formatters';
import type { ExpenseTypeSettlementTotal } from '../../../types/accounts.types';

function EmployeeRow({
  empName, totalSettledAmount, details,
}: {
  empName: string;
  totalSettledAmount: number;
  details: ExpenseTypeSettlementTotal[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => setOpen((o) => !o)}>
        <TableCell sx={{ width: 40 }}>
          <IconButton size="small">
            {open ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 600 }}>{empName}</TableCell>
        <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(totalSettledAmount)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ p: 0, ...(open ? {} : { border: 0 }) }} colSpan={3}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 1.5, px: 2, bgcolor: 'action.hover' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Expense Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Settled Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details.map((d) => (
                    <TableRow key={d.expenseType}>
                      <TableCell sx={{ border: 0 }}>{d.expenseType}</TableCell>
                      <TableCell sx={{ border: 0 }}>{formatCurrency(d.totalSettledAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export const SettlementReportPage = () => {
  const { user } = useAuthContext();
  const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useSettlementReport(user?.empId, fromDate, toDate);
  const employeeTotals = data?.employeeTotals ?? [];
  const expenseTypeTotals = data?.expenseTypeTotals ?? [];

  const employees = useMemo(() => {
    const seen = new Map<string, string>();
    (data?.employeeTotals ?? []).forEach((e) => { if (!seen.has(e.empId)) seen.set(e.empId, e.empName); });
    return Array.from(seen, ([empId, empName]) => ({ empId, empName }));
  }, [data]);

  const rows = employeeTotals
    .filter((e) => !selectedEmpId || e.empId === selectedEmpId)
    .filter((e) => !search || e.empName.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <DatePicker
            label="From Date"
            value={dayjs(fromDate)}
            maxDate={dayjs(toDate)}
            onChange={(v) => v && setFromDate(v.format('YYYY-MM-DD'))}
            slotProps={{ textField: { size: 'small' } }}
          />
          <DatePicker
            label="To Date"
            value={dayjs(toDate)}
            minDate={dayjs(fromDate)}
            onChange={(v) => v && setToDate(v.format('YYYY-MM-DD'))}
            slotProps={{ textField: { size: 'small' } }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)} displayEmpty>
              <MenuItem value=""><em>All Employees</em></MenuItem>
              {employees.map((e) => (
                <MenuItem key={e.empId} value={e.empId}>{e.empName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </LocalizationProvider>

      {data && (
        <Paper variant="outlined" sx={{ px: 2.5, py: 1.5, mb: 2.5, borderRadius: 2, display: 'inline-flex', gap: 1.5, alignItems: 'baseline' }}>
          <Typography variant="body2" color="text.secondary">Total Settled</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatCurrency(data.totalSettledAmount)}</Typography>
        </Paper>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, px: 2.5, py: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Settled Amount by Employee</Typography>
          <TextField
            size="small"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
        </Box>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : rows.length === 0 ? (
          <EmptyState />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 40 }} />
                  <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Settled</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <EmployeeRow
                    key={row.empId}
                    empName={row.empName}
                    totalSettledAmount={row.totalSettledAmount}
                    details={expenseTypeTotals.filter((t) => t.empId === row.empId)}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};
