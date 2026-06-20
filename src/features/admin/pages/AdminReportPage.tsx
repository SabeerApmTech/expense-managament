import {
  Box, Paper, Typography, Grid, TextField, Button,
  Table, TableHead, TableRow, TableCell, TableBody,
  CircularProgress, MenuItem, Select, FormControl, InputLabel,
  ListSubheader, InputAdornment,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useExpenseReport } from '../hooks/useAdminExpenses';
import { useEmployees } from '../hooks/useAdminMaster';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import { StatusChip } from '../../../components/common/StatusChip';
import type { Expense } from '../../../types/expense.types';

export const AdminReportPage = () => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [rows, setRows] = useState<Expense[]>([]);

  const { data: employees = [] } = useEmployees();
  const { mutate: fetchReport, isPending } = useExpenseReport();

  const filteredEmployees = employees.filter((e) =>
    e.name.toLowerCase().includes(employeeSearch.toLowerCase()),
  );

  const handleGenerate = () => {
    fetchReport(
      { fromDate, toDate, employeeId },
      { onSuccess: (data) => setRows(data) },
    );
  };

  const handleDownloadCSV = () => {
    const headers = ['Expense No', 'Employee', 'Type', 'From Date', 'To Date', 'Amount', 'Status'];
    const csvRows = [
      headers.join(','),
      ...rows.map((r) =>
        [
          r.expenseNo ?? '', r.employeeName ?? '', r.expenseType,
          r.fromDate, r.toDate, r.amount, r.status,
        ]
          .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
          .join(','),
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-report-${fromDate || 'all'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Expense Report', 14, 16);
    if (fromDate || toDate) {
      doc.setFontSize(10);
      doc.text(`Period: ${fromDate || '—'} to ${toDate || '—'}`, 14, 24);
    }
    autoTable(doc, {
      startY: fromDate || toDate ? 30 : 22,
      head: [['Expense No', 'Employee', 'Type', 'From', 'To', 'Amount', 'Status']],
      body: rows.map((r) => [
        r.expenseNo ?? '', r.employeeName ?? '', r.expenseType,
        formatDate(r.fromDate), formatDate(r.toDate),
        formatCurrency(r.amount), r.status,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [25, 118, 210] },
    });
    doc.save(`expense-report-${fromDate || 'all'}.pdf`);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Reports</Typography>

      {/* Filter Card */}
      <Paper sx={{ borderRadius: 3, p: 2.5, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FilterAltIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Filter</Typography>
        </Box>
        <Grid container spacing={2} sx={{ alignItems: 'flex-end' }}>
          <Grid size={{ xs: 12, sm: 3 }}>
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
          <Grid size={{ xs: 12, sm: 3 }}>
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
          <Grid size={{ xs: 12, sm: 4 }}>
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
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
                  />
                </ListSubheader>
                <MenuItem value="">All Employees</MenuItem>
                {filteredEmployees.map((e) => (
                  <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerate}
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : <FilterAltIcon />}
              sx={{ height: 40 }}
            >
              Generate
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Table */}
      {rows.length > 0 && (
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.75 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Results — {rows.length} record{rows.length !== 1 ? 's' : ''}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadCSV}
                sx={{ borderRadius: 2 }}
              >
                CSV
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<PictureAsPdfIcon />}
                onClick={handleDownloadPDF}
                sx={{ borderRadius: 2 }}
              >
                PDF
              </Button>
            </Box>
          </Box>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  {['Expense No', 'Employee', 'Type', 'From Date', 'To Date', 'Amount', 'Status'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={r.id ?? i} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.expenseNo ?? '—'}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{r.employeeName ?? '—'}</TableCell>
                    <TableCell>{r.expenseType}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(r.fromDate)}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(r.toDate)}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'right' }}>{formatCurrency(r.amount)}</TableCell>
                    <TableCell><StatusChip status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}

      {rows.length === 0 && !isPending && (
        <Paper sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Set filters and click Generate to see the report.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
