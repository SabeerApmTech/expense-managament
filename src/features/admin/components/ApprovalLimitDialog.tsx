import {
  Button, TextField, Box, Typography, CircularProgress, Grid, Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useMemo, useState } from 'react';
import { useApprovalLimits, useSaveApprovalLimit } from '../hooks/useAdminMaster';
import { ManagedItemDialog } from '../../../components/common/ManagedItemDialog';

interface Props { open: boolean; onClose: () => void; asPanel?: boolean; }

type LimitForm = { initiatedLimit: string; adminLimit: string; superAdminLimit: string };

const EMPTY: LimitForm = { initiatedLimit: '', adminLimit: '', superAdminLimit: '' };

export const ApprovalLimitDialog = ({ open, onClose, asPanel = false }: Props) => {
  const [draft, setDraft] = useState<LimitForm | null>(null);
  const [errors, setErrors] = useState(EMPTY);

  const { data: limits = [] } = useApprovalLimits();
  const { mutate: save, isPending: saving } = useSaveApprovalLimit();

  const existing = limits[0] ?? null;
  const initialForm = useMemo<LimitForm>(() => (
    existing
      ? {
          initiatedLimit: String(existing.initiatedLimit),
          adminLimit: String(existing.adminLimit),
          superAdminLimit: String(existing.superAdminLimit),
        }
      : EMPTY
  ), [existing]);

  const form = draft ?? initialForm;

  const updateForm = (field: keyof LimitForm, value: string) => {
    setDraft({ ...form, [field]: value });
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const e = { ...EMPTY };
    let ok = true;
    if (!form.initiatedLimit || isNaN(Number(form.initiatedLimit))) { e.initiatedLimit = 'Required'; ok = false; }
    if (!form.adminLimit || isNaN(Number(form.adminLimit))) { e.adminLimit = 'Required'; ok = false; }
    if (!form.superAdminLimit || isNaN(Number(form.superAdminLimit))) { e.superAdminLimit = 'Required'; ok = false; }
    setErrors(e);
    return ok;
  };

  const handleSave = () => {
    if (!validate()) return;
    save({
      id: existing?.id ?? 0,
      initiatedLimit: Number(form.initiatedLimit),
      adminLimit: Number(form.adminLimit),
      superAdminLimit: Number(form.superAdminLimit),
    }, { onSuccess: () => setDraft(null) });
  };

  const content = (
    <Box sx={{ px: 3, py: 2.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Set the maximum amount each role can approve. These limits apply globally across all employees.
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            size="small" label="Initiated By Limit (₹)" fullWidth
            value={form.initiatedLimit} error={!!errors.initiatedLimit} helperText={errors.initiatedLimit}
            onChange={(e) => updateForm('initiatedLimit', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            type="number" slotProps={{ htmlInput: { min: 0 } }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Amount the initiator can self-approve
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            size="small" label="Admin Limit (₹)" fullWidth
            value={form.adminLimit} error={!!errors.adminLimit} helperText={errors.adminLimit}
            onChange={(e) => updateForm('adminLimit', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            type="number" slotProps={{ htmlInput: { min: 0 } }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Amount admin can approve
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            size="small" label="Super Admin Limit (₹)" fullWidth
            value={form.superAdminLimit} error={!!errors.superAdminLimit} helperText={errors.superAdminLimit}
            onChange={(e) => updateForm('superAdminLimit', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            type="number" slotProps={{ htmlInput: { min: 0 } }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Amount super admin can approve
          </Typography>
        </Grid>
      </Grid>
      <Divider sx={{ my: 2.5 }} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave} disabled={saving}
          startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}>
          {saving ? 'Saving…' : 'Save Limits'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <ManagedItemDialog
      open={open} onClose={onClose} asPanel={asPanel}
      title="Approval Limits" dividers={false}
    >
      {content}
    </ManagedItemDialog>
  );
};