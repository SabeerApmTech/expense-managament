import {
  Button, Box, Typography, Select, MenuItem, CircularProgress, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow, FormControl, InputLabel, Grid,
  TextField, ListSubheader,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { useState, useMemo } from 'react';
import {
  useLevels, useEmployees, useEmployeeLevelMaps,
  useSaveEmployeeLevelMap, useUpdateEmployeeLevelMap, useDeleteEmployeeLevelMap,
} from '../hooks/useAdminMaster';
import { ManagedItemDialog } from '../../../components/common/ManagedItemDialog';
import { DeleteConfirmDialog } from '../../../components/common/DeleteConfirmDialog';
import type { EmployeeLevelMap } from '../../../types/expense.types';

interface Props { open: boolean; onClose: () => void; asPanel?: boolean; }

const EMPTY = { employeeId: '', levelId: '' };

export const LevelEmployeeMappingDialog = ({ open, onClose, asPanel = false }: Props) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<typeof EMPTY>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [mappingSearch, setMappingSearch] = useState('');

  const { data: levels = [] } = useLevels();
  const { data: employees = [] } = useEmployees();
  const { data: maps = [], isLoading } = useEmployeeLevelMaps();
  const { mutate: saveMap, isPending: isSaving } = useSaveEmployeeLevelMap();
  const { mutate: updateMap, isPending: isUpdating } = useUpdateEmployeeLevelMap();
  const { mutate: deleteMap, isPending: isDeleting } = useDeleteEmployeeLevelMap();

  const isPending = isSaving || isUpdating;

  const mappedEmployeeIds = useMemo(
    () => new Set(maps.filter(m => m.id !== (editingId ?? -1)).map(m => m.employeeId)),
    [maps, editingId]
  );

  const filteredEmployees = useMemo(
    () => employees.filter(e =>
      !mappedEmployeeIds.has(e.id)
      && e.name.toLowerCase().includes(employeeSearch.toLowerCase())
    ),
    [employees, employeeSearch, mappedEmployeeIds]
  );

  const filteredMaps = useMemo(() => {
    const q = mappingSearch.trim().toLowerCase();
    if (!q) return maps;
    return maps.filter(m =>
      m.employeeName.toLowerCase().includes(q)
      || m.levelName.toLowerCase().includes(q)
    );
  }, [maps, mappingSearch]);

  const validate = () => {
    const e: Partial<typeof EMPTY> = {};
    if (!form.employeeId) e.employeeId = 'Required';
    if (!form.levelId) e.levelId = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const payload = { employeeId: form.employeeId, levelId: Number(form.levelId) };
    if (editingId !== null) {
      updateMap({ id: editingId, ...payload }, { onSuccess: resetForm });
    } else {
      saveMap(payload, { onSuccess: resetForm });
    }
  };

  const resetForm = () => { setForm(EMPTY); setErrors({}); setEditingId(null); setEmployeeSearch(''); };

  const handleStartEdit = (row: EmployeeLevelMap) => {
    setEditingId(row.id);
    setForm({ employeeId: row.employeeId, levelId: String(row.levelId) });
    setErrors({}); setEmployeeSearch('');
  };

  const formSection = (
    <Box sx={{ px: 3, pt: 2, pb: 2, flexShrink: 0 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
        {editingId !== null ? 'Edit Mapping' : 'Add New'}
      </Typography>
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small" error={!!errors.employeeId}>
            <InputLabel>Employee *</InputLabel>
            <Select label="Employee *" value={form.employeeId}
              onChange={(e) => setForm(f => ({ ...f, employeeId: String(e.target.value) }))}
              onClose={() => setEmployeeSearch('')}
              MenuProps={{ autoFocus: false, slotProps: { paper: { sx: { maxHeight: 300 } } } }}>
              <ListSubheader sx={{ px: 1, py: 0.75, lineHeight: 'normal', bgcolor: 'background.paper' }}>
                <TextField size="small" fullWidth autoFocus placeholder="Search employee..."
                  value={employeeSearch} onChange={(e) => setEmployeeSearch(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}
                  slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> } }} />
              </ListSubheader>
              {filteredEmployees.length === 0
                ? <MenuItem disabled><em>No results</em></MenuItem>
                : filteredEmployees.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small" error={!!errors.levelId}>
            <InputLabel>Level *</InputLabel>
            <Select label="Level *" value={form.levelId}
              onChange={(e) => setForm(f => ({ ...f, levelId: String(e.target.value) }))}>
              {levels.map(l => <MenuItem key={l.id} value={l.id}>{l.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          {editingId !== null && (
            <Button variant="outlined" onClick={resetForm} disabled={isPending}>Cancel</Button>
          )}
          <Button variant="contained" onClick={handleSubmit} disabled={isPending}
            startIcon={isPending ? <CircularProgress size={14} color="inherit" /> : <AddIcon />}
            sx={{ minWidth: 120 }}>
            {editingId !== null ? 'Update' : 'Add'}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  const listSection = (
    <Box sx={{ px: 3, pb: 2 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 5 }}>
          <CircularProgress size={32} />
        </Box>
      ) : maps.length > 0 && (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Existing Mappings</Typography>
            <TextField
              size="small"
              placeholder="Search Employees"
              value={mappingSearch}
              onChange={(e) => setMappingSearch(e.target.value)}
              sx={{ width: 220, ml: 'auto' }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="action" /></InputAdornment> } }}
            />
          </Box>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Table size="small" stickyHeader sx={{ minWidth: 320 }}>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Level</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 80 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMaps.map(m => (
                  <TableRow key={m.id} hover selected={editingId === m.id}>
                    <TableCell>{m.employeeName}</TableCell>
                    <TableCell>{m.levelName}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <IconButton size="small" color="primary" onClick={() => handleStartEdit(m)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => setDeleteTargetId(m.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredMaps.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ color: 'text.secondary', py: 2 }}>
                      No mappings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <ManagedItemDialog
      open={open} onClose={onClose} asPanel={asPanel}
      title="Level Employee Mapping"
      extras={
        <DeleteConfirmDialog
          open={deleteTargetId !== null}
          onClose={() => setDeleteTargetId(null)}
          onConfirm={() => deleteMap(deleteTargetId!, { onSuccess: () => setDeleteTargetId(null) })}
          isDeleting={isDeleting}
          title="Delete Mapping"
        />
      }
    >
      {formSection}
      {listSection}
    </ManagedItemDialog>
  );
};
