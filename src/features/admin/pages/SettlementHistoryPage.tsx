import {
  Box, Paper, Typography, Grid, TextField, Button,
  CircularProgress, MenuItem, Select, FormControl, InputLabel,
  ListSubheader, InputAdornment, Avatar, Chip, Stack, Tooltip, Divider,
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { useState } from 'react';
import dayjs from 'dayjs';
import { useSettlementHistory } from '../hooks/useAdminExpenses';
import { useEmployees } from '../hooks/useAdminMaster';
import { useExpenseTypes } from '../../expenses/hooks/useMasterData';
import { formatDate, formatCurrency, getInitials } from '../../../utils/formatters';
import { EmptyState } from '../../../components/common/EmptyState';
import type {
  SettlementHistoryResponse,
  DailySettlementSummary,
  MonthlySettlementSummary,
  EmployeeSettlementSummary,
} from '../../../types/expense.types';

const ACCENT = '#1a3bcc';
const MEDAL_COLORS = ['#c9971f', '#8f97a3', '#b06a35'];

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) => (
  <Paper sx={{ borderRadius: 3, p: 2.25, display: 'flex', alignItems: 'center', gap: 1.75, height: '100%' }}>
    <Box
      sx={{
        width: 46,
        height: 46,
        flexShrink: 0,
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: `${color}1a`,
        color,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.25 }} noWrap>
        {value}
      </Typography>
    </Box>
  </Paper>
);

const DailyTrendChart = ({ data }: { data: DailySettlementSummary[] }) => {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.25, height: 240, overflowX: 'auto', px: 0.5, pb: 1 }}>
      {data.map((d) => {
        const heightPct = Math.max((d.amount / max) * 100, 4);
        return (
          <Tooltip
            key={d.date}
            arrow
            title={
              <Box sx={{ textAlign: 'center', py: 0.25 }}>
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>
                  {formatDate(d.date)}
                </Typography>
                <Typography variant="caption">{formatCurrency(d.amount)}</Typography>
              </Box>
            }
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: '0 0 auto',
                width: 36,
                height: '100%',
                justifyContent: 'flex-end',
                cursor: 'pointer',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: `${heightPct}%`,
                  borderRadius: '8px 8px 3px 3px',
                  background: 'linear-gradient(180deg, #5b7cff 0%, #1a3bcc 100%)',
                  transition: 'filter .15s ease, transform .15s ease',
                  transformOrigin: 'bottom',
                  '&:hover': { filter: 'brightness(1.12)', transform: 'scaleY(1.015)' },
                }}
              />
              <Typography variant="caption" sx={{ mt: 0.75, fontSize: 10.5, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                {dayjs(d.date).format('D MMM')}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
};

const EmployeeBreakdown = ({ data }: { data: EmployeeSettlementSummary[] }) => {
  const max = Math.max(...data.map((e) => e.amount), 1);
  const total = data.reduce((s, e) => s + e.amount, 0);
  return (
    <Stack spacing={2.25}>
      {data.map((e, i) => {
        const pct = (e.amount / max) * 100;
        const share = total ? (e.amount / total) * 100 : 0;
        const medal = i < 3 ? MEDAL_COLORS[i] : undefined;
        return (
          <Box key={e.employeeId}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: 12.5,
                  fontWeight: 700,
                  bgcolor: medal ?? '#e4ebff',
                  color: medal ? '#fff' : ACCENT,
                }}
              >
                {getInitials(e.employeeName)}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
                {e.employeeName}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                {formatCurrency(e.amount)}
              </Typography>
              <Chip
                label={`${share.toFixed(1)}%`}
                size="small"
                sx={{ bgcolor: '#f1f3f9', fontWeight: 600, fontSize: 11, height: 22 }}
              />
            </Box>
            <Box sx={{ height: 8, borderRadius: 4, bgcolor: '#f1f3f9', overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${pct}%`,
                  borderRadius: 4,
                  background: medal ? medal : 'linear-gradient(90deg, #5b7cff, #1a3bcc)',
                  transition: 'width .4s ease',
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};

const MonthlyOverview = ({ data }: { data: MonthlySettlementSummary[] }) => {
  const max = Math.max(...data.map((m) => m.amount), 1);
  return (
    <Stack spacing={1.5}>
      {data.map((m) => {
        const pct = (m.amount / max) * 100;
        return (
          <Box
            key={`${m.year}-${m.month}`}
            sx={{ p: 1.75, borderRadius: 2.5, bgcolor: '#f8f9ff', border: '1px solid #e4ebff' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CalendarMonthIcon sx={{ fontSize: 18, color: ACCENT }} />
              <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>
                {m.monthName}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: ACCENT }}>
                {formatCurrency(m.amount)}
              </Typography>
            </Box>
            <Box sx={{ height: 6, borderRadius: 3, bgcolor: '#e4ebff', overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${pct}%`, borderRadius: 3, bgcolor: ACCENT }} />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};

export const SettlementHistoryPage = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [expenseTypeId, setExpenseTypeId] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [data, setData] = useState<SettlementHistoryResponse | null>(null);

  const { data: employees = [] } = useEmployees();
  const { data: expenseTypes = [] } = useExpenseTypes();
  const { mutate: fetchHistory, isPending } = useSettlementHistory();

  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(employeeSearch.toLowerCase()),
  );

  const handleView = () => {
    fetchHistory(
      {
        fromDate: fromDate ? new Date(fromDate).toISOString() : '',
        toDate: toDate ? new Date(toDate).toISOString() : '',
        employeeId,
        expenseTypeId: expenseTypeId ? Number(expenseTypeId) : 0,
      },
      { onSuccess: (res) => setData(res) },
    );
  };

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setEmployeeId('');
    setExpenseTypeId('');
    setEmployeeSearch('');
    setData(null);
  };

  const hasData = !!data && (data.dailySummary.length > 0 || data.monthlySummary.length > 0 || data.employeeSummary.length > 0);
  const totalAmount = data?.dailySummary.reduce((s, d) => s + d.amount, 0) ?? 0;
  const daysRecorded = data?.dailySummary.length ?? 0;
  const employeesInvolved = data?.employeeSummary.length ?? 0;
  const topEmployee = data?.employeeSummary[0];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Settlement History</Typography>
        <Typography variant="body2" color="text.secondary">
          Visual breakdown of settled expense amounts by day, month and employee
        </Typography>
      </Box>

      {/* Filter Card */}
      <Paper sx={{ borderRadius: 3, p: 2.5, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterAltIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Filter</Typography>
        </Box>
        <Grid container spacing={2} sx={{ alignItems: 'flex-end' }}>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              label="From Date"
              type="date"
              size="small"
              fullWidth
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <TextField
              label="To Date"
              type="date"
              size="small"
              fullWidth
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Employee</InputLabel>
              <Select
                value={employeeId}
                label="Employee"
                onChange={(e) => setEmployeeId(String(e.target.value))}
                onClose={() => setEmployeeSearch('')}
                MenuProps={{ autoFocus: false, slotProps: { paper: { sx: { maxHeight: 300 } } } }}
              >
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
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </ListSubheader>
                <MenuItem value="">All Employees</MenuItem>
                {filteredEmployees.map((e) => (
                  <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Expense Type</InputLabel>
              <Select
                value={expenseTypeId}
                label="Expense Type"
                onChange={(e) => setExpenseTypeId(String(e.target.value))}
              >
                <MenuItem value="">All Types</MenuItem>
                {expenseTypes.map((t) => (
                  <MenuItem key={t.id} value={String(t.id)}>{t.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleView}
                disabled={isPending}
                startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : <ShowChartIcon />}
                sx={{ height: 40 }}
              >
                View
              </Button>
              <Button
                variant="outlined"
                onClick={handleReset}
                disabled={isPending}
                sx={{ height: 40, minWidth: 40, px: 1 }}
              >
                <RestartAltIcon fontSize="small" />
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Results */}
      {hasData && data && (
        <Box>
          {/* KPI Stat Row */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                icon={<AccountBalanceWalletIcon />}
                label="Total Settled Amount"
                value={formatCurrency(totalAmount)}
                color={ACCENT}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                icon={<EventAvailableIcon />}
                label="Days Recorded"
                value={String(daysRecorded)}
                color="#0f9d58"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                icon={<GroupsIcon />}
                label="Employees Involved"
                value={String(employeesInvolved)}
                color="#e07b1a"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                icon={<EmojiEventsIcon />}
                label="Top Employee"
                value={topEmployee ? topEmployee.employeeName : '—'}
                color="#c9971f"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            {/* Daily Trend */}
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper sx={{ borderRadius: 3, p: 2.5, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ShowChartIcon fontSize="small" sx={{ color: ACCENT }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Daily Trend</Typography>
                </Box>
                {data.dailySummary.length > 0 ? (
                  <DailyTrendChart data={data.dailySummary} />
                ) : (
                  <EmptyState title="No daily data" description="No settlements recorded in this period." />
                )}
              </Paper>
            </Grid>

            {/* Monthly Overview */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper sx={{ borderRadius: 3, p: 2.5, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CalendarMonthIcon fontSize="small" sx={{ color: ACCENT }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Monthly Overview</Typography>
                </Box>
                {data.monthlySummary.length > 0 ? (
                  <MonthlyOverview data={data.monthlySummary} />
                ) : (
                  <EmptyState title="No monthly data" description="No settlements recorded in this period." />
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Employee Breakdown */}
          <Paper sx={{ borderRadius: 3, p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PeopleAltIcon fontSize="small" sx={{ color: ACCENT }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Employee-wise Settlement</Typography>
            </Box>
            <Divider sx={{ mb: 2.5 }} />
            {data.employeeSummary.length > 0 ? (
              <EmployeeBreakdown data={data.employeeSummary} />
            ) : (
              <EmptyState title="No employee data" description="No settlements recorded in this period." />
            )}
          </Paper>
        </Box>
      )}

      {!hasData && !isPending && (
        <Paper sx={{ borderRadius: 3, p: 5, textAlign: 'center' }}>
          <ShowChartIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
          <Typography color="text.secondary">
            Set filters and click <strong>View</strong> to see settlement history.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
