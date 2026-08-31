import {
  Box, Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  Collapse, IconButton, Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ApartmentIcon from '@mui/icons-material/Apartment';
import { useState } from 'react';
import dayjs from 'dayjs';
import { LoadingState } from '../../../components/common/LoadingState';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { useOfficeExpenseSettlement } from '../hooks/useAccounts';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import type { OfficeExpenseSettlementType } from '../../../types/accounts.types';

function ExpenseTypeRow({ item }: { item: OfficeExpenseSettlementType }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => setOpen((o) => !o)}>
        <TableCell sx={{ width: 40 }}>
          <IconButton size="small" sx={{ pointerEvents: 'none' }}>
            {open ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 600 }}>{item.expenseTypeName}</TableCell>
        <TableCell>{formatCurrency(item.totalSettledAmount)}</TableCell>
        <TableCell>
          <Chip size="small" label={`${item.settlement.length} settlement${item.settlement.length === 1 ? '' : 's'}`} variant="outlined" />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ p: 0, ...(open ? {} : { border: 0 }) }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 1, px: 2, bgcolor: 'action.hover' }}>
              {item.settlement.map((s, i) => (
                <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: i < item.settlement.length - 1 ? '1px solid' : 0, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">{formatDateTime(s.settledOn)}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{formatCurrency(s.settlementAmount)}</Typography>
                </Box>
              ))}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export const OfficeReportsPage = () => {
  const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [toDate, setToDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
  const { data = [], isLoading, isError, refetch } = useOfficeExpenseSettlement(fromDate, toDate);

  const grandTotal = data.reduce(
    (sum, office) => sum + office.expenseTypes.reduce((s, t) => s + t.totalSettledAmount, 0),
    0
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <ApartmentIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Office Wise Reports</Typography>
      </Box>

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
            <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5 }}>Total Settled — All Offices</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{formatCurrency(grandTotal)}</Typography>
          </Paper>

          {data.length === 0 ? (
            <EmptyState />
          ) : (
            data.map((office) => {
              const officeTotal = office.expenseTypes.reduce((s, t) => s + t.totalSettledAmount, 0);
              return (
                <Paper key={office.officeId} variant="outlined" sx={{ borderRadius: 2, mb: 2.5, overflow: 'hidden' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, px: 2.5, py: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{office.officeName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {[office.city, office.state, office.country].filter(Boolean).join(', ')}
                      </Typography>
                    </Box>
                    <Chip label={formatCurrency(officeTotal)} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                  </Box>
                  {office.expenseTypes.length === 0 ? (
                    <Box sx={{ px: 2.5, pb: 2.5 }}>
                      <Typography variant="caption" color="text.secondary">No settled expenses in this period</Typography>
                    </Box>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: 40 }} />
                          <TableCell sx={{ fontWeight: 600 }}>Expense Type</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Total Settled</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Settlements</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {office.expenseTypes.map((t) => (
                          <ExpenseTypeRow key={t.expenseTypeId} item={t} />
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Paper>
              );
            })
          )}
        </>
      )}
    </Box>
  );
};
