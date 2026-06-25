import {
  Drawer, Box, Typography, IconButton, Divider, Grid, Button, Paper,
  TextField, Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PaymentsIcon from '@mui/icons-material/Payments';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useMemo, useState } from 'react';
import { StatusChip } from '../../../components/common/StatusChip';
import { Field, FieldLabel } from '../../../components/common/Field';
import { BillAttachments } from '../../../components/common/BillAttachments';
import { BillViewerDialog } from '../../../components/common/BillViewerDialog';
import { useExpenseLookupMaps } from '../../expenses/hooks/useExpenseLookupMaps';
import { useApproveExpense, useRejectExpense, useSettleExpense } from '../hooks/useAdminExpenses';
import { useApprovalLimits, useEmployees } from '../hooks/useAdminMaster';
import { useAuthContext } from '../../../store/authStore';
import { formatDate, formatCurrency, formatDateTime } from '../../../utils/formatters';
import type { Expense } from '../../../types/expense.types';

interface Props {
  open: boolean;
  expense: Expense | null;
  onClose: () => void;
}

type ActionMode = 'approve' | 'reject' | 'settle' | null;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 1.25 }}>
      {title}
    </Typography>
    <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2, border: '1px solid', borderColor: 'grey.200' }}>
      <Grid container spacing={2}>
        {children}
      </Grid>
    </Box>
  </Box>
);

function DrawerContent({ expense, onClose }: { expense: Expense; onClose: () => void }) {
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [settlementFile, setSettlementFile] = useState<File | null>(null);
  const [settlementFileError, setSettlementFileError] = useState('');
  const [settlementRemarks, setSettlementRemarks] = useState('');

  const { expTypeMap, payModeMap, travelModeMap } = useExpenseLookupMaps();
  const { data: limits = [] } = useApprovalLimits();
  const { data: employees = [] } = useEmployees();
  const { role } = useAuthContext();

  const employeeMap = useMemo<Record<string, string>>(
    () => Object.fromEntries(employees.map(e => [e.id, e.name])),
    [employees],
  );

  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();
  const settleMutation = useSettleExpense();

  const approvalLimit = limits[0];
  const adminLimit = approvalLimit?.adminLimit ?? Infinity;
  const statusNum = Number(expense.status);
  const exceedsAdminLimit = expense.amount > adminLimit;

  // Items with an initiator assigned that haven't been initiator-approved yet
  const pendingInitiatorItems = (expense.details ?? []).filter(
    d => d.initiatedBy && !d.initiatedApprovedBy,
  );
  const hasPendingInitiatorApproval = pendingInitiatorItems.length > 0;
  const cannotApprove = hasPendingInitiatorApproval;

  // Case 1: amount ≤ adminLimit → admin approves (status 3) → admin can settle
  // Case 2: amount > adminLimit → admin approves (status 3) → super admin approves (status 4) → admin can settle
  // Admin sees Approve/Reject for status 1 and 2
  // Super Admin sees Approve/Reject for status 3 when amount > adminLimit (and also 1, 2)
  const isPending =
    role === 'SUPER_ADMIN'
      ? (statusNum === 1 || statusNum === 2 || (statusNum === 3 && exceedsAdminLimit))
      : (statusNum === 1 || statusNum === 2);

  // Settle is available to admin when:
  // Case 1: status 3 (Admin Approved) AND amount ≤ adminLimit
  // Case 2: status 4 (Super Admin Approved)
  const isSettleable = statusNum === 4 || (statusNum === 3 && !exceedsAdminLimit);

  const resetAction = () => {
    setActionMode(null);
    setRejectReason('');
    setRejectError('');
    setSettlementFile(null);
    setSettlementFileError('');
    setSettlementRemarks('');
  };

  const handleApprove = () => {
    const approveStatus = role === 'SUPER_ADMIN' ? 4 : 3;
    approveMutation.mutate(
      { expenseId: Number(expense.id), status: approveStatus },
      { onSuccess: () => { resetAction(); onClose(); } },
    );
  };

  const handleReject = () => {
    if (!rejectReason.trim()) { setRejectError('Rejection reason is required'); return; }
    rejectMutation.mutate(
      { expenseId: Number(expense.id), reason: rejectReason },
      { onSuccess: () => { resetAction(); onClose(); } },
    );
  };

  const handleSettle = () => {
    if (!settlementFile) { setSettlementFileError('Settlement bill is required'); return; }
    settleMutation.mutate(
      { expenseId: expense.id, settlementBillFile: settlementFile, remarks: settlementRemarks },
      { onSuccess: () => { resetAction(); onClose(); } },
    );
  };

  return (
    <Box sx={{ p: 2.5, overflowY: 'auto', flex: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f0f4ff', borderRadius: 2, px: 2, py: 1.5, mb: 2.5 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>{expense.expenseNo}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25, display: 'block' }}>
            Submitted {formatDateTime(expense.submittedOn ?? '')}
          </Typography>
        </Box>
        <StatusChip status={expense.status} />
      </Box>

      <Section title="Employee">
        <Grid size={{ xs: 6 }}><Field label="Employee Name" value={expense.employeeName} compact /></Grid>
        <Grid size={{ xs: 6 }}>
          <FieldLabel>Total Amount</FieldLabel>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatCurrency(expense.amount)}</Typography>
        </Grid>
      </Section>

{expense.rejectReason && (
        <>
          <Divider sx={{ mb: 2.5 }} />
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'warning.dark', letterSpacing: 1, textTransform: 'uppercase', display: 'block', mb: 1.25 }}>
              Rejection Reason
            </Typography>
            <Box sx={{ bgcolor: '#fffde7', borderRadius: 2, p: 2, border: '1px solid', borderColor: 'warning.light' }}>
              <Typography variant="body2">{expense.rejectReason}</Typography>
            </Box>
          </Box>
        </>
      )}

      {(expense.settlementBillUrl || expense.settlementRemarks) && (
        <Section title="Settlement">
          {expense.settledBy && <Grid size={{ xs: 6 }}><Field label="Settled By" value={employeeMap[expense.settledBy] ?? expense.settledBy} compact /></Grid>}
          {expense.settledDate && <Grid size={{ xs: 6 }}><Field label="Settled On" value={formatDateTime(expense.settledDate)} compact /></Grid>}
          {expense.settlementRemarks && <Grid size={{ xs: 12 }}><Field label="Remarks" value={expense.settlementRemarks} compact /></Grid>}
          {expense.settlementBillUrl && (
            <Grid size={{ xs: 12 }}>
              <BillAttachments billUrl={expense.settlementBillUrl} onView={setViewerUrl} label="Settlement Bill" />
            </Grid>
          )}
        </Section>
      )}

      <Divider sx={{ mb: 2.5 }} />

      {(expense.details ?? []).map((detail, i) => (
        <Paper key={detail.id} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          {(expense.details?.length ?? 0) > 1 && (
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>Item #{i + 1}</Typography>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}><Field label="Expense Type" value={expTypeMap[detail.expenseTypeId] ?? String(detail.expenseTypeId)} compact /></Grid>
            <Grid size={{ xs: 6 }}>
              <FieldLabel>Amount</FieldLabel>
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatCurrency(detail.amount)}</Typography>
            </Grid>
            <Grid size={{ xs: 6 }}><Field label="From Date" value={formatDate(detail.fromDate)} compact /></Grid>
            <Grid size={{ xs: 6 }}><Field label="To Date" value={formatDate(detail.toDate)} compact /></Grid>
            <Grid size={{ xs: 6 }}><Field label="Pay Mode" value={payModeMap[detail.payModeId] ?? String(detail.payModeId)} compact /></Grid>
            <Grid size={{ xs: 6 }}><Field label="Travel Mode" value={travelModeMap[detail.travelModeId] ?? String(detail.travelModeId)} compact /></Grid>
            <Grid size={{ xs: 6 }}><Field label="From Location" value={detail.areaFrom} compact /></Grid>
            <Grid size={{ xs: 6 }}><Field label="To Location" value={detail.areaTo} compact /></Grid>
            {detail.initiatedBy && (
              <Grid size={{ xs: 6 }}><Field label="Initiated By" value={employeeMap[detail.initiatedBy] ?? detail.initiatedBy} compact /></Grid>
            )}
            {detail.description && <Grid size={{ xs: 12 }}><Field label="Description" value={detail.description} compact /></Grid>}
            {detail.billUrl && (
              <Grid size={{ xs: 12 }}>
                <BillAttachments billUrl={detail.billUrl} onView={setViewerUrl} label="Attachments" />
              </Grid>
            )}
          </Grid>
        </Paper>
      ))}

      {(isPending || isSettleable) && (
        <Box sx={{ mt: 1, pt: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
          {actionMode === 'approve' && (
            <Box>
              {hasPendingInitiatorApproval && (
                <Alert severity="warning" icon={<WarningAmberIcon fontSize="inherit" />} sx={{ mb: 1.5 }}>
                  {pendingInitiatorItems.length} item{pendingInitiatorItems.length > 1 ? 's are' : ' is'} pending initiator approval — the assigned initiator must approve first.
                </Alert>
              )}
              {!cannotApprove && (
                <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
                  Confirm approval of <strong>{expense.expenseNo}</strong> for <strong>{formatCurrency(expense.amount)}</strong>?
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={resetAction} fullWidth size="small">Cancel</Button>
                <Button variant="contained" color="success" fullWidth size="small"
                  onClick={handleApprove} disabled={approveMutation.isPending || cannotApprove}
                  startIcon={approveMutation.isPending ? undefined : <CheckCircleIcon />}>
                  {approveMutation.isPending ? 'Approving…' : 'Confirm Approve'}
                </Button>
              </Box>
            </Box>
          )}

          {actionMode === 'reject' && (
            <Box>
              <TextField
                label="Rejection Reason" fullWidth size="small" multiline rows={2}
                value={rejectReason}
                onChange={(e) => { setRejectReason(e.target.value); setRejectError(''); }}
                error={!!rejectError} helperText={rejectError}
                autoFocus sx={{ mb: 1.5 }}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={resetAction} fullWidth size="small">Cancel</Button>
                <Button variant="contained" color="error" fullWidth size="small"
                  onClick={handleReject} disabled={rejectMutation.isPending}
                  startIcon={rejectMutation.isPending ? undefined : <CancelIcon />}>
                  {rejectMutation.isPending ? 'Rejecting…' : 'Confirm Reject'}
                </Button>
              </Box>
            </Box>
          )}

          {actionMode === 'settle' && (
            <Box>
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}>
                  Settlement Bill *
                </Typography>
                <Button component="label" variant="outlined" size="small"
                  startIcon={<AttachFileIcon />} color={settlementFileError ? 'error' : 'primary'}>
                  {settlementFile ? settlementFile.name : 'Choose File'}
                  <input type="file" hidden accept="image/*,application/pdf"
                    onChange={(e) => { setSettlementFile(e.target.files?.[0] ?? null); setSettlementFileError(''); }}
                  />
                </Button>
                {settlementFileError && (
                  <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>{settlementFileError}</Typography>
                )}
              </Box>
              <TextField label="Remarks" size="small" fullWidth multiline rows={2}
                value={settlementRemarks}
                onChange={(e) => setSettlementRemarks(e.target.value)}
                sx={{ mb: 1.5 }} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={resetAction} fullWidth size="small">Cancel</Button>
                <Button variant="contained" color="info" fullWidth size="small"
                  onClick={handleSettle} disabled={settleMutation.isPending}
                  startIcon={settleMutation.isPending ? undefined : <PaymentsIcon />}>
                  {settleMutation.isPending ? 'Settling…' : 'Confirm Settle'}
                </Button>
              </Box>
            </Box>
          )}

          {!actionMode && (
            <Box>
              {isPending && hasPendingInitiatorApproval && (
                <Alert severity="warning" icon={<WarningAmberIcon fontSize="inherit" />} sx={{ mb: 1.5 }}>
                  {pendingInitiatorItems.length} item{pendingInitiatorItems.length > 1 ? 's are' : ' is'} pending initiator approval before you can approve.
                </Alert>
              )}
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {isPending && (
                  <>
                    <Button variant="contained" color="success" fullWidth startIcon={<CheckCircleIcon />}
                      onClick={() => setActionMode('approve')} disabled={cannotApprove}>
                      Approve
                    </Button>
                    <Button variant="contained" color="error" fullWidth startIcon={<CancelIcon />}
                      onClick={() => setActionMode('reject')}>
                      Reject
                    </Button>
                  </>
                )}
                {isSettleable && (
                  <Button variant="contained" color="info" fullWidth startIcon={<PaymentsIcon />}
                    onClick={() => setActionMode('settle')}>
                    Mark as Settled
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {viewerUrl && (
        <BillViewerDialog open={!!viewerUrl} url={viewerUrl} onClose={() => setViewerUrl(null)} />
      )}
    </Box>
  );
}

export const AdminExpenseDrawer = ({ open, expense, onClose }: Props) => (
  <Drawer
    anchor="right"
    open={open}
    onClose={onClose}
    slotProps={{ paper: { sx: { width: { xs: '100%', sm: 480 }, display: 'flex', flexDirection: 'column' } } }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#f5f7ff', flexShrink: 0 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, flex: 1 }}>Expense Details</Typography>
      <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
    </Box>
    {expense && <DrawerContent expense={expense} onClose={onClose} />}
  </Drawer>
);
