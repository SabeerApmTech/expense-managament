import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, Select, MenuItem, TextField, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, FormControl, InputLabel, Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import { useDesignations, useDesignationExpenseMaps, useSaveDesignationExpenseMap } from '../hooks/useAdminMaster';
import { useExpenseTypes } from '../../expenses/hooks/useMasterData';

interface Props { open: boolean; onClose: () => void; }

const EMPTY = { designationId: '', expenseTypeId: '', amountRangeFrom: '', amountRangeTo: '' };

export const DesignationExpenseMappingDialog = ({ open, onClose }: Props) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<typeof EMPTY>>({});

  const { data: designations = [] } = useDesignations();
  const { data: expenseTypes = [] } = useExpenseTypes();
  const { data: maps = [] } = useDesignationExpenseMaps();
  const { mutate, isPending } = useSaveDesignationExpenseMap();

  const validate = () => {
    const e: Partial<typeof EMPTY> = {};
    if (!form.designationId) e.designationId = 'Required';
    if (!form.expenseTypeId) e.expenseTypeId = 'Required';
    if (!form.amountRangeFrom) e.amountRangeFrom = 'Required';
    if (!form.amountRangeTo) e.amountRangeTo = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAdd = () => {
    if (!validate()) return;
    mutate({
      id: 0,
      designationId: Number(form.designationId),
      expenseTypeId: Number(form.expenseTypeId),
      amountRangeFrom: Number(form.amountRangeFrom),
      amountRangeTo: Number(form.amountRangeTo),
    }, { onSuccess: () => setForm(EMPTY) });
  };

  const designationName = (id: number) => designations.find(d => d.id === id)?.designationName ?? id;
  const expenseTypeName = (id: number) => expenseTypes.find(e => e.id === id)?.name ?? id;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Designation Expense Limits</DialogTitle>
      <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ px: 3, pt: 2, pb: 2, flexShrink: 0 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>Add New</Typography>
        <Grid container spacing={2} sx={{ mb: 1 }}>
          {/* Row 1: Designation + Expense Type — equal width */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small" error={!!errors.designationId}>
              <InputLabel>Designation *</InputLabel>
              <Select label="Designation *" value={form.designationId} onChange={(e) => setForm(f => ({ ...f, designationId: String(e.target.value) }))}>
                {designations.map(d => <MenuItem key={d.id} value={d.id}>{d.designationName}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small" error={!!errors.expenseTypeId}>
              <InputLabel>Expense Type *</InputLabel>
              <Select label="Expense Type *" value={form.expenseTypeId} onChange={(e) => setForm(f => ({ ...f, expenseTypeId: String(e.target.value) }))}>
                {expenseTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>

          {/* Row 2: Amount From + Amount To — equal width */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField size="small" label="Amount Range From *" type="number" fullWidth
              value={form.amountRangeFrom} error={!!errors.amountRangeFrom}
              onChange={(e) => setForm(f => ({ ...f, amountRangeFrom: e.target.value }))} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField size="small" label="Amount Range To *" type="number" fullWidth
              value={form.amountRangeTo} error={!!errors.amountRangeTo}
              onChange={(e) => setForm(f => ({ ...f, amountRangeTo: e.target.value }))} />
          </Grid>

          {/* Add button right-aligned */}
          <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={handleAdd} disabled={isPending}
              startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
              sx={{ minWidth: 120 }}>
              Add
            </Button>
          </Grid>
        </Grid>
        </Box>

        <Box sx={{ overflowY: 'auto', flex: 1, px: 3, pb: 2 }}>
        {maps.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Existing Mappings</Typography>
            {/* outer box clips border-radius; inner box enables x-scroll on mobile */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 400 }}>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Expense Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Amount From</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Amount To</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {maps.map(m => (
                      <TableRow key={m.id} hover>
                        <TableCell>{designationName(m.designationId)}</TableCell>
                        <TableCell>{expenseTypeName(m.expenseTypeId)}</TableCell>
                        <TableCell align="right">₹{m.amountRangeFrom.toLocaleString()}</TableCell>
                        <TableCell align="right">₹{m.amountRangeTo.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Box>
          </Box>
        )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  );
};
