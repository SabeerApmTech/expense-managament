import {
  Box, Paper, Typography, FormControl, Select, MenuItem, TextField, InputAdornment, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Fragment, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { LoadingState } from '../../../components/common/LoadingState';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { BillViewerDialog } from '../../../components/common/BillViewerDialog';
import { useSettledExpenses } from '../hooks/useAccounts';
import { useAuthContext } from '../../../store/authStore';
import { resolveSettlementBillUrl } from '../../../api/accounts.api';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import type { SettledExpenseRecord } from '../../../types/accounts.types';

export const SettledExpensesTab = () => {
  const { user } = useAuthContext();
  const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [search, setSearch] = useState('');
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  // Unfiltered, so the employee dropdown's options don't collapse to just the
  // currently-selected employee once a filter is applied.
  const { data: allData } = useSettledExpenses(user?.empId, fromDate, toDate);
  const employees = useMemo(() => {
    const seen = new Map<string, string>();
    (allData?.data ?? []).forEach((r) => { if (!seen.has(r.empId)) seen.set(r.empId, r.empName); });
    return Array.from(seen, ([empId, empName]) => ({ empId, empName }));
  }, [allData]);

  const { data, isLoading, isError, refetch } = useSettledExpenses(user?.empId, fromDate, toDate, selectedEmpId || undefined);

  const filtered = useMemo(() => {
    const list = data?.data ?? [];
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter((r) =>
      r.empName.toLowerCase().includes(q)
      || r.expenseCode.toLowerCase().includes(q)
      || r.expenseTypeName.toLowerCase().includes(q)
    );
  }, [data, search]);

  // Group by expenseCode, preserving first-seen order.
  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, SettledExpenseRecord[]>();
    filtered.forEach((r) => {
      const list = map.get(r.expenseCode);
      if (list) list.push(r);
      else { map.set(r.expenseCode, [r]); order.push(r.expenseCode); }
    });
    return order.map((code) => [code, map.get(code) as SettledExpenseRecord[]] as const);
  }, [filtered]);

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

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, px: 2.5, py: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Settled Expenses</Typography>
          <TextField
            size="small"
            placeholder="Search settled expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 260 }}
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
        ) : groups.length === 0 ? (
          <EmptyState />
        ) : (
          <Box sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 320px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Expense Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Settled Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Settled On</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map(([expenseCode, items]) => (
                  <Fragment key={expenseCode}>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell colSpan={4}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {expenseCode} · {items[0].empName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total {formatCurrency(items.reduce((s, i) => s + i.settledAmount, 0))}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                    {items.map((item) => (
                      <TableRow key={item.expenseDetailId} hover>
                        <TableCell>{item.expenseTypeName}</TableCell>
                        <TableCell>{formatCurrency(item.settledAmount)}</TableCell>
                        <TableCell>{formatDateTime(item.settlementDate)}</TableCell>
                        <TableCell align="right">
                          {item.settlementBillPath && (
                            <IconButton
                              size="small"
                              title="View Bill"
                              onClick={() => setViewerUrl(resolveSettlementBillUrl(item.settlementBillPath))}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>

      {viewerUrl && <BillViewerDialog open={!!viewerUrl} url={viewerUrl} onClose={() => setViewerUrl(null)} />}
    </Box>
  );
};
