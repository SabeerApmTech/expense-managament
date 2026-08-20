import {
  Box, Paper, Typography, TextField, InputAdornment, IconButton, Tabs, Tab,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import { Fragment, useMemo, useState } from 'react';
import { LoadingState } from '../../../components/common/LoadingState';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { ApprovalDrawer } from '../components/ApprovalDrawer';
import { useApprovalEmployeeExpenses } from '../hooks/useApprovals';
import { useAuthContext } from '../../../store/authStore';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import { exportGroupedPDF, exportGroupedExcel } from '../../../utils/tableExport';
import type { ApprovalExpenseDetail } from '../../../types/approval.types';

type FlatRow = ApprovalExpenseDetail & { empName: string };

const STATUS_KEYS = ['pending', 'approved', 'rejected'] as const;
const TAB_TITLES = ['Pending Approvals', 'Approved Expenses', 'Rejected Expenses'];

export const ApprovalsListPage = () => {
  const { user } = useAuthContext();
  const empId = user?.empId ?? '';
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useApprovalEmployeeExpenses(empId);
  const expenses = data?.expenses ?? [];
  // Derived fresh from the live query data on every render (rather than a snapshot
  // captured at click time), so approving/rejecting an item — which refetches this
  // list — is reflected in the open drawer immediately instead of only after a reload.
  const selected = expenses.find((e) => e.expenseId === selectedExpenseId) ?? null;
  const totals = expenses.reduce(
    (acc, e) => ({
      pending: acc.pending + e.pendingCount,
      approved: acc.approved + e.approvedCount,
      rejected: acc.rejected + e.rejectedCount,
    }),
    { pending: 0, approved: 0, rejected: 0 }
  );

  const statusKey = STATUS_KEYS[tab];
  const rows: FlatRow[] = expenses.flatMap((e) => e[statusKey].map((d) => ({ ...d, empName: e.empName })));

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      r.empName.toLowerCase().includes(q)
      || r.expenseCode.toLowerCase().includes(q)
      || r.expenseTypeName.toLowerCase().includes(q)
    );
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
        heading: `${expenseCode} · ${items[0].empName}`,
        meta: `Submitted ${formatDate(items[0].submittedOn)} · Total ${formatCurrency(items.reduce((s, i) => s + i.amount, 0))}`,
        columns: ['Expense Type', 'Amount'],
        rows: items.map((item) => [item.expenseTypeName, formatCurrency(item.amount)]),
      })),
    [groups]
  );

  const openDrawer = (expenseId: number) => setSelectedExpenseId(expenseId);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs value={tab} onChange={(_e, v) => { setTab(v); setSearch(''); }} sx={{ mb: 2.5, flexShrink: 0 }}>
        <Tab label={`Pending (${totals.pending})`} />
        <Tab label={`Approved (${totals.approved})`} />
        <Tab label={`Rejected (${totals.rejected})`} />
      </Tabs>

      <Paper variant="outlined" sx={{ borderRadius: 2, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, px: 2.5, py: 2, flexShrink: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{TAB_TITLES[tab]}</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search employee, expense code, or type..."
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
            <IconButton
              size="small"
              title="Export PDF"
              disabled={exportSections.length === 0}
              onClick={() => exportGroupedPDF(TAB_TITLES[tab], exportSections)}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 0.75 }}
            >
              <PictureAsPdfIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              title="Export Excel"
              disabled={exportSections.length === 0}
              onClick={() => exportGroupedExcel(TAB_TITLES[tab], exportSections)}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 0.75 }}
            >
              <GridOnIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : groups.length === 0 ? (
          <EmptyState />
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
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {expenseCode} · {items[0].empName}
                          </Typography>
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
                          <IconButton size="small" title="View" onClick={() => openDrawer(item.expenseId)}>
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

      <ApprovalDrawer
        open={selected !== null}
        empId={empId}
        expense={selected}
        initialTab={tab}
        onClose={() => setSelectedExpenseId(null)}
      />
    </Box>
  );
};
