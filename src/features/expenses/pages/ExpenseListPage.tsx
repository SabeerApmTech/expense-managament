import {
  Box, Paper, Typography, TextField, InputAdornment, IconButton, Tabs, Tab, Button,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import { Fragment, useMemo, useState } from 'react';
import { LoadingState } from '../../../components/common/LoadingState';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { ExpenseDrawer } from '../components/ExpenseDrawer';
import { ExpenseUsageSummary } from '../components/ExpenseUsageSummary';
import type { DrawerMode } from '../components/ExpenseDrawer';
import { useExpenseList } from '../hooks/useExpenses';
import { useExpenseTypes } from '../../expenseTypes/hooks/useExpenseTypes';
import { useAuthContext } from '../../../store/authStore';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import { exportGroupedPDF, exportGroupedExcel } from '../../../utils/tableExport';
import type { ExpenseDetailItem } from '../../../types/expense.types';
import type { ExpenseCategory } from '../../../types/expenseType.types';

type FlatRow = ExpenseDetailItem & { submittedOn: string };

const STATUS_KEYS = ['pending', 'approved', 'rejected'] as const;
const TAB_TITLES = ['Pending', 'Approved', 'Rejected'];

interface Props {
  category: ExpenseCategory;
  title: string;
}

export const ExpenseListPage = ({ category, title }: Props) => {
  const { user } = useAuthContext();
  const empId = user?.empId ?? '';
  const [mode, setMode] = useState<DrawerMode>(null);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');

  const { data = [], isLoading, isError, refetch } = useExpenseList(empId);
  const { data: expenseTypes = [] } = useExpenseTypes();

  // expenseTypeId -> category, so items belonging to the other category (My Expenses
  // vs Office Expenses) never show up on this page, even though both live under the
  // same underlying expense.
  const categoryByTypeId = useMemo(
    () => new Map(expenseTypes.map((t) => [t.expenseTypeId, t.expenseCategory])),
    [expenseTypes]
  );
  const belongsHere = (d: ExpenseDetailItem) => categoryByTypeId.get(d.expenseTypeId) === category;

  // Derived fresh from the live query data on every render (rather than a snapshot
  // captured at click time), so editing/deleting an item — which refetches this
  // list — is reflected in the open drawer immediately instead of only after a reload.
  // The raw expense's pending/approved/rejected arrays span both categories (an
  // "expense" just groups items submitted together) — filtered down here too, so the
  // drawer opened from this page only ever shows this page's category.
  const rawSelectedExpense = data.find((e) => e.expenseId === selectedExpenseId) ?? null;
  const selectedExpense = rawSelectedExpense && {
    ...rawSelectedExpense,
    pending: rawSelectedExpense.pending.filter(belongsHere),
    approved: rawSelectedExpense.approved.filter(belongsHere),
    rejected: rawSelectedExpense.rejected.filter(belongsHere),
    pendingCount: rawSelectedExpense.pending.filter(belongsHere).length,
    approvedCount: rawSelectedExpense.approved.filter(belongsHere).length,
    rejectedCount: rawSelectedExpense.rejected.filter(belongsHere).length,
  };

  const totals = data.reduce(
    (acc, e) => ({
      pending: acc.pending + e.pending.filter(belongsHere).length,
      approved: acc.approved + e.approved.filter(belongsHere).length,
      rejected: acc.rejected + e.rejected.filter(belongsHere).length,
    }),
    { pending: 0, approved: 0, rejected: 0 }
  );

  const statusKey = STATUS_KEYS[tab];
  const rows: FlatRow[] = data.flatMap((e) =>
    e[statusKey].filter(belongsHere).map((d) => ({ ...d, submittedOn: e.submittedOn }))
  );

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => r.expenseCode.toLowerCase().includes(q) || r.expenseTypeName.toLowerCase().includes(q));
  }, [rows, search]);

  // Group by expenseCode, preserving first-seen order. Groups are derived from the
  // already-filtered rows, so a group with zero matching items in this tab/search
  // simply never appears — no empty groups to special-case.
  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, FlatRow[]>();
    filtered.forEach((r) => {
      const list = map.get(r.expenseCode);
      if (list) list.push(r);
      else { map.set(r.expenseCode, [r]); order.push(r.expenseCode); }
    });
    return order.map((code) => [code, map.get(code) as FlatRow[]] as const);
  }, [filtered]);

  const exportSections = useMemo(
    () =>
      groups.map(([expenseCode, items]) => ({
        heading: expenseCode,
        meta: `Submitted ${formatDate(items[0].submittedOn)} · Total ${formatCurrency(items.reduce((s, i) => s + i.amount, 0))}`,
        columns: ['Expense Type', 'Amount'],
        rows: items.map((item) => [item.expenseTypeName, formatCurrency(item.amount)]),
      })),
    [groups]
  );

  const openDrawer = (drawerMode: DrawerMode, expenseId?: number) => {
    setMode(drawerMode);
    setSelectedExpenseId(expenseId ?? null);
  };
  const closeDrawer = () => setMode(null);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {empId && <ExpenseUsageSummary empId={empId} category={category} />}

      <Tabs value={tab} onChange={(_e, v) => { setTab(v); setSearch(''); }} sx={{ mb: 2.5, flexShrink: 0 }}>
        <Tab label={`Pending (${totals.pending})`} />
        <Tab label={`Approved (${totals.approved})`} />
        <Tab label={`Rejected (${totals.rejected})`} />
      </Tabs>

      <Paper variant="outlined" sx={{ borderRadius: 2, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 420 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, px: 2.5, py: 2, flexShrink: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{TAB_TITLES[tab]} {title}</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search expense code or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 240 }}
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
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openDrawer('add')}>
              Add Expense
            </Button>
            <IconButton
              size="small"
              title="Export PDF"
              disabled={exportSections.length === 0}
              onClick={() => exportGroupedPDF(`${TAB_TITLES[tab]} ${title}`, exportSections)}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 0.75 }}
            >
              <PictureAsPdfIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              title="Export Excel"
              disabled={exportSections.length === 0}
              onClick={() => exportGroupedExcel(`${TAB_TITLES[tab]} ${title}`, exportSections)}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 0.75 }}
            >
              <GridOnIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LoadingState />
          </Box>
        ) : isError ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ErrorState onRetry={refetch} />
          </Box>
        ) : groups.length === 0 ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState />
          </Box>
        ) : (
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Expense Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map(([expenseCode, items]) => (
                  <Fragment key={expenseCode}>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell colSpan={3}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{expenseCode}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Submitted {formatDate(items[0].submittedOn)} · Total {formatCurrency(items.reduce((s, i) => s + i.amount, 0))}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                    {items.map((item) => (
                      <TableRow key={item.expenseDetailId} hover>
                        <TableCell>{item.expenseTypeName}</TableCell>
                        <TableCell>{formatCurrency(item.amount)}</TableCell>
                        <TableCell align="right">
                          <IconButton size="small" title="View" onClick={() => openDrawer('view', item.expenseId)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
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

      <ExpenseDrawer mode={mode} category={category} expense={selectedExpense} initialTab={tab} onClose={closeDrawer} />
    </Box>
  );
};
