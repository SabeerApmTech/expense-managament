import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useState } from 'react';
import dayjs from 'dayjs';
import { LoadingState } from '../../../components/common/LoadingState';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { useSettlementReport } from '../hooks/useAccounts';
import { useAuthContext } from '../../../store/authStore';
import { formatCurrency } from '../../../utils/formatters';

export const MySettlementsPage = () => {
  const { user } = useAuthContext();
  const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));

  const { data, isLoading, isError, refetch } = useSettlementReport(user?.empId, fromDate, toDate);
  const expenseTypeTotals = data?.expenseTypeTotals ?? [];

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
        </Box>
      </LocalizationProvider>

      {data && (
        <Paper variant="outlined" sx={{ px: 2.5, py: 1.5, mb: 2.5, borderRadius: 2, display: 'inline-flex', gap: 1.5, alignItems: 'baseline' }}>
          <Typography variant="body2" color="text.secondary">Total Settled</Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>{formatCurrency(data.totalSettledAmount)}</Typography>
        </Paper>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2 }}>
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Settled Amount by Expense Type</Typography>
        </Box>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : expenseTypeTotals.length === 0 ? (
          <EmptyState />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Expense Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Settled Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenseTypeTotals.map((t) => (
                  <TableRow key={t.expenseType} hover>
                    <TableCell>{t.expenseType}</TableCell>
                    <TableCell>{formatCurrency(t.totalSettledAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};
