import {
  Table, TableBody, TableCell, TableHead, TableRow, TableSortLabel,
  Paper, Box, TextField, InputAdornment, Typography, Divider,
  IconButton, Menu, MenuItem, Button, Select, FormControl,
  Card, CardContent, Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Column, PaginationState, SortState } from '../../types/common.types';
import { LoadingState } from './LoadingState';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';

export interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  color?: 'error' | 'warning' | 'success' | 'primary' | 'info';
}

interface Props<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  rowKey: keyof T;
  title?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  defaultPageSize?: number;
  onAdd?: () => void;
  addLabel?: string;
  rowActions?: (row: T) => ActionItem[];
  pdfSummary?: { label: string; value: string }[];
}

function exportCSV<T extends Record<string, unknown>>(
  columns: Column<T>[],
  rows: T[],
  filename: string
) {
  const cols = columns.filter((c) => String(c.id) !== 'actions');
  const header = cols.map((c) => '"' + c.label + '"').join(',');
  const body = rows.map((row) =>
    cols
      .map((c) => '"' + String(row[c.id as keyof T] ?? '').replace(/"/g, '""') + '"')
      .join(',')
  );
  const csv = [header, ...body].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (filename || 'export') + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const pdfSafe = (str: string) =>
  Array.from(str.replace(/₹/g, 'Rs. '), (char) => (char.charCodeAt(0) <= 0x7f ? char : '?')).join('');

function exportPDF<T extends Record<string, unknown>>(
  columns: Column<T>[],
  rows: T[],
  filename: string,
  summary?: { label: string; value: string }[]
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(filename || 'Export', 14, 18);

  let startY = 28;

  if (summary && summary.length > 0) {
    doc.setFontSize(9);
    doc.setDrawColor(200, 210, 255);
    doc.setFillColor(240, 244, 255);
    const boxH = summary.length * 7 + 6;
    doc.roundedRect(14, startY, pageWidth - 28, boxH, 2, 2, 'FD');
    summary.forEach((item, i) => {
      doc.setFont('helvetica', 'bold');
      doc.text(item.label + ':', 18, startY + 6 + i * 7);
      doc.setFont('helvetica', 'normal');
      doc.text(pdfSafe(item.value), 65, startY + 6 + i * 7);
    });
    startY += boxH + 6;
  }

  const cols = columns.filter((c) => String(c.id) !== 'actions');
  autoTable(doc, {
    head: [cols.map((c) => c.label)],
    body: rows.map((row) => cols.map((c) => pdfSafe(String(row[c.id as keyof T] ?? '-')))),
    startY,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.1 },
    headStyles: { fillColor: [26, 59, 204], textColor: 255, fontStyle: 'bold', lineColor: [26, 59, 204] },
    alternateRowStyles: { fillColor: [248, 249, 255] },
    margin: { left: 14, right: 14 },
  });

  doc.save((filename || 'export') + '.pdf');
}

function RowActionMenu({ actions }: { actions: ActionItem[] }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  if (!actions.length) return null;
  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}
        sx={{ color: 'text.secondary' }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { elevation: 3, sx: { borderRadius: 2, minWidth: 150 } } }}
      >
        {actions.map((action) => (
          <MenuItem
            key={action.label}
            disabled={action.disabled}
            onClick={() => { setAnchor(null); action.onClick(); }}
            sx={{
              gap: 1,
              fontSize: 14,
              color:
                action.color === 'error'
                  ? 'error.main'
                  : action.color === 'success'
                  ? 'success.main'
                  : action.color === 'warning'
                  ? 'warning.main'
                  : action.color === 'info'
                  ? 'info.main'
                  : 'inherit',
            }}
          >
            {action.icon}
            {action.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  loading,
  error,
  onRetry,
  rowKey,
  title,
  searchable = true,
  searchPlaceholder = 'Search...',
  defaultPageSize = 10,
  onAdd,
  addLabel = 'Add',
  rowActions,
  pdfSummary,
}: Props<T>) {
  const [pagination, setPagination] = useState<PaginationState>({ page: 0, pageSize: defaultPageSize });
  const [sort, setSort] = useState<SortState>({ field: '', direction: 'asc' });
  const [search, setSearch] = useState('');

  const handleSort = (field: string) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPagination((p) => ({ ...p, page: 0 }));
  };

  const dataColumns = columns.filter((c) => String(c.id) !== 'actions');

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(q))
    );
  }, [rows, search]);

  const sorted = useMemo(() => {
    if (!sort.field) return filtered;
    return [...filtered].sort((a, b) => {
      const av = String(a[sort.field] ?? '');
      const bv = String(b[sort.field] ?? '');
      return sort.direction === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [filtered, sort]);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pagination.pageSize));
  const startItem = totalItems === 0 ? 0 : pagination.page * pagination.pageSize + 1;
  const endItem = Math.min((pagination.page + 1) * pagination.pageSize, totalItems);

  const paginated = sorted.slice(
    pagination.page * pagination.pageSize,
    (pagination.page + 1) * pagination.pageSize
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState onRetry={onRetry} />;

  return (
    <Paper sx={{ borderRadius: 3, overflow: 'clip' }}>
      {/* ── Header bar ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          px: { xs: 1.5, sm: 2.5 },
          py: 2,
        }}
      >
        {title && (
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        )}
        {searchable && (
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, page: 0 })); }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 auto' },
              maxWidth: { sm: 260 },
              '& .MuiOutlinedInput-root': { borderRadius: 6, bgcolor: 'grey.50' },
            }}
          />
        )}
        <Box sx={{ flex: 1 }} />
        {onAdd && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{
              borderRadius: 6,
              px: 2.5,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              bgcolor: '#1a3bcc',
              '&:hover': { bgcolor: '#1531b0' },
            }}
          >
            {addLabel}
          </Button>
        )}
        <IconButton
          size="small"
          title="Export PDF"
          onClick={() => exportPDF(columns, sorted, title ?? 'export', pdfSummary)}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 0.75 }}
        >
          <PictureAsPdfIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          title="Export CSV"
          onClick={() => exportCSV(columns, sorted, title ?? 'export')}
          sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 0.75 }}
        >
          <GridOnIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider />

      {/* ── Card view: xs → md ── */}
      <Box sx={{ display: { xs: 'block', lg: 'none' }, p: { xs: 1.5, sm: 2 } }}>
        {paginated.length === 0 ? (
          <EmptyState />
        ) : (
          <Grid container spacing={2}>
            {paginated.map((row) => {
              const actions = rowActions ? rowActions(row) : [];
              return (
                <Grid key={String(row[rowKey])} size={{ xs: 12, sm: 6 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      position: 'relative',
                      transition: 'box-shadow 0.2s',
                      '&:hover': { boxShadow: 3 },
                    }}
                  >
                    {actions.length > 0 && (
                      <Box sx={{ position: 'absolute', top: 6, right: 6, zIndex: 1 }}>
                        <RowActionMenu actions={actions} />
                      </Box>
                    )}
                    <CardContent sx={{ pt: 2, pb: '12px !important', pr: actions.length ? 5.5 : 2 }}>
                      <Grid container spacing={1.5}>
                        {dataColumns.map((col) => (
                          <Grid key={String(col.id)} size={{ xs: 6 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', lineHeight: 1.4, mb: 0.25 }}
                            >
                              {col.label}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
                              {col.render
                                ? col.render(row[col.id as keyof T], row)
                                : String(row[col.id as keyof T] ?? '-')}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* ── Table view: lg+ ── */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'block' },
          overflow: 'auto',
          maxHeight: 'calc(100vh - 180px)',
          '&::-webkit-scrollbar': { width: 4, height: 4 },
          '&::-webkit-scrollbar-thumb': { borderRadius: 2, bgcolor: 'grey.300' },
        }}
      >
        <Table
          stickyHeader
          sx={{
            '& .MuiTableCell-root': { borderRight: '1px solid', borderRightColor: 'rgba(200,210,255,0.5)' },
          }}
        >
          <TableHead>
            <TableRow>
              {dataColumns.map((col) => (
                <TableCell
                  key={String(col.id)}
                  align={col.align || 'left'}
                  sx={{
                    minWidth: col.minWidth,
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 12,
                    py: 1,
                    px: 1.5,
                    bgcolor: '#1a3bcc',
                    borderBottom: '2px solid #1531b0',
                    borderRightColor: 'rgba(255,255,255,0.2)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={sort.field === String(col.id)}
                      direction={sort.field === String(col.id) ? sort.direction : 'asc'}
                      onClick={() => handleSort(String(col.id))}
                      sx={{
                        color: 'white !important',
                        '& .MuiTableSortLabel-icon': { color: 'rgba(255,255,255,0.7) !important' },
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
              {rowActions && (
                <TableCell
                  align="center"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 12,
                    py: 1,
                    px: 1.5,
                    bgcolor: '#1a3bcc',
                    borderBottom: '2px solid #1531b0',
                    borderRightColor: 'rgba(255,255,255,0.2)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Actions
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={dataColumns.length + (rowActions ? 1 : 0)} sx={{ border: 0 }}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row, idx) => {
                const actions = rowActions ? rowActions(row) : [];
                return (
                  <TableRow
                    key={String(row[rowKey])}
                    sx={{
                      bgcolor: idx % 2 === 1 ? '#f0f4ff' : 'background.paper',
                      '&:hover': { bgcolor: '#e4ebff' },
                      '& td': { py: 0.75, px: 1.5, fontSize: 13, borderColor: 'rgba(200,210,255,0.5)' },
                    }}
                  >
                    {dataColumns.map((col) => (
                      <TableCell key={String(col.id)} align={col.align || 'left'}>
                        {col.render
                          ? col.render(row[col.id as keyof T], row)
                          : String(row[col.id as keyof T] ?? '-')}
                      </TableCell>
                    ))}
                    {rowActions && (
                      <TableCell align="center">
                        <RowActionMenu actions={actions} />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>

      {/* ── Footer pagination ── */}
      <Divider />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.5,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {totalItems === 0 ? 'No items' : `${startItem}–${endItem} of ${totalItems} items`}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => setPagination((p) => ({ ...p, page: Math.max(0, p.page - 1) }))}
            disabled={pagination.page === 0}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {pagination.page + 1}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setPagination((p) => ({ ...p, page: Math.min(totalPages - 1, p.page + 1) }))}
            disabled={pagination.page >= totalPages - 1}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
          <FormControl size="small" sx={{ ml: 1 }}>
            <Select
              value={pagination.pageSize}
              onChange={(e) => setPagination({ page: 0, pageSize: Number(e.target.value) })}
              sx={{ fontSize: 13, borderRadius: 2 }}
            >
              {[5, 10, 25, 50].map((n) => (
                <MenuItem key={n} value={n}>
                  {n} / page
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>
    </Paper>
  );
}
