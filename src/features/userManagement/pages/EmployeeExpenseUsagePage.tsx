import {
  Box, Paper, Typography, FormControl, Select, MenuItem, TextField, InputAdornment, Chip,
  Table, TableBody, TableCell, TableHead, TableRow, Collapse, IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import { useMemo, useState } from 'react';
import { LoadingState } from '../../../components/common/LoadingState';
import { EmptyState } from '../../../components/common/EmptyState';
import { ErrorState } from '../../../components/common/ErrorState';
import { useAllEmpExpenseTypeUsage } from '../hooks/useUserManagement';
import { useAuthContext } from '../../../store/authStore';
import { formatCurrency } from '../../../utils/formatters';
import { exportGroupedPDF, exportGroupedExcel } from '../../../utils/tableExport';
import type { EmployeeExpenseTypeUsage } from '../../../types/user.types';

function EmployeeGroupRow({ empName, items }: { empName: string; items: EmployeeExpenseTypeUsage[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => setOpen((o) => !o)}>
        <TableCell sx={{ width: 40 }}>
          <IconButton size="small">
            {open ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
          </IconButton>
        </TableCell>
        <TableCell colSpan={5} sx={{ fontWeight: 700 }}>{empName}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ p: 0, ...(open ? {} : { border: 0 }) }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 1.5, px: 2, bgcolor: 'action.hover' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Expense Type</TableCell>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Limit</TableCell>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Spent</TableCell>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Remaining</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => {
                    const spent = item.settledAmount + item.pendingAmount;
                    return (
                      <TableRow key={item.userExpenseTypeId}>
                        <TableCell sx={{ border: 0 }}>{item.expenseTypeName}</TableCell>
                        <TableCell sx={{ border: 0 }}><Chip size="small" label={item.expenseCategory} variant="outlined" /></TableCell>
                        <TableCell sx={{ border: 0 }}>{formatCurrency(item.limitAmount)}</TableCell>
                        <TableCell sx={{ border: 0 }}>{formatCurrency(spent)}</TableCell>
                        <TableCell sx={{ border: 0 }}>
                          <Chip
                            size="small"
                            label={formatCurrency(item.remainingAmount)}
                            color={item.remainingAmount <= 0 ? 'error' : 'success'}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export const EmployeeExpenseUsagePage = () => {
  const { user: currentUser } = useAuthContext();
  const { data = [], isLoading, isError, refetch } = useAllEmpExpenseTypeUsage(currentUser?.empId ?? null);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [search, setSearch] = useState('');

  const employees = useMemo(() => {
    const seen = new Map<string, string>();
    data.forEach((d) => { if (!seen.has(d.empId)) seen.set(d.empId, d.empName); });
    return Array.from(seen, ([empId, empName]) => ({ empId, empName }));
  }, [data]);

  const filtered = useMemo(() => {
    let rows = selectedEmpId ? data.filter((d) => d.empId === selectedEmpId) : data;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.empName.toLowerCase().includes(q) || r.expenseTypeName.toLowerCase().includes(q));
    }
    return rows;
  }, [data, selectedEmpId, search]);

  // Group by employee, preserving first-seen order.
  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, EmployeeExpenseTypeUsage[]>();
    filtered.forEach((r) => {
      const list = map.get(r.empId);
      if (list) list.push(r);
      else { map.set(r.empId, [r]); order.push(r.empId); }
    });
    return order.map((empId) => [empId, map.get(empId) as EmployeeExpenseTypeUsage[]] as const);
  }, [filtered]);

  const exportSections = useMemo(
    () =>
      groups.map(([, items]) => ({
        heading: items[0].empName,
        columns: ['Expense Type', 'Category', 'Limit', 'Spent', 'Remaining'],
        rows: items.map((item) => [
          item.expenseTypeName,
          item.expenseCategory,
          formatCurrency(item.limitAmount),
          formatCurrency(item.settledAmount + item.pendingAmount),
          formatCurrency(item.remainingAmount),
        ]),
      })),
    [groups]
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper variant="outlined" sx={{ borderRadius: 2, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, px: 2.5, py: 2, flexShrink: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Employee Expense Usage — This Month</Typography>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search employees..."
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
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)} displayEmpty>
                <MenuItem value=""><em>All Employees</em></MenuItem>
                {employees.map((e) => (
                  <MenuItem key={e.empId} value={e.empId}>{e.empName}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton
              size="small"
              title="Export PDF"
              disabled={exportSections.length === 0}
              onClick={() => exportGroupedPDF('Employee Expense Usage', exportSections)}
              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 0.75 }}
            >
              <PictureAsPdfIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              title="Export Excel"
              disabled={exportSections.length === 0}
              onClick={() => exportGroupedExcel('Employee Expense Usage', exportSections)}
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
                  <TableCell sx={{ width: 40 }} />
                  <TableCell colSpan={5} sx={{ fontWeight: 600 }}>Employee</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map(([empId, items]) => (
                  <EmployeeGroupRow key={empId} empName={items[0].empName} items={items} />
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
