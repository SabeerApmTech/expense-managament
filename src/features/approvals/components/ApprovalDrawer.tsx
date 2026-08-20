import {
  Drawer, Box, Typography, IconButton, Divider, Paper, Button, Tabs, Tab,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useState } from 'react';
import { Field } from '../../../components/common/Field';
import { BillAttachments } from '../../../components/common/BillAttachments';
import { BillViewerDialog } from '../../../components/common/BillViewerDialog';
import { StatusChip } from '../../../components/common/StatusChip';
import { useUpdateApproval } from '../hooks/useApprovals';
import { useExpenseBills } from '../../expenses/hooks/useExpenses';
import { resolveBillUrl } from '../../../api/expenses.api';
import { useAuthContext } from '../../../store/authStore';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import type { ApprovalExpenseDetail, ApprovalExpenseSummary } from '../../../types/approval.types';

interface Props {
  open: boolean;
  empId: string;
  expense: ApprovalExpenseSummary | null;
  initialTab?: number;
  onClose: () => void;
}

function DetailBills({ expenseDetailId, onView }: { expenseDetailId: number; onView: (url: string) => void }) {
  const { data: bills = [] } = useExpenseBills(expenseDetailId);
  if (!bills.length) return null;
  const billUrl = bills.map((b) => resolveBillUrl(b.bill)).join(',');
  return <BillAttachments billUrl={billUrl} onView={onView} label="Bills" />;
}

function DetailCard({
  detail, employeeName, showInitiatedBy, onApprove, onRejectClick, isUpdating, onViewBill,
}: {
  detail: ApprovalExpenseDetail;
  employeeName?: string;
  showInitiatedBy: boolean;
  onApprove: (approvalId: number) => void;
  onRejectClick: (approvalId: number) => void;
  isUpdating: boolean;
  onViewBill: (url: string) => void;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{detail.expenseTypeName}</Typography>
        <StatusChip status={detail.status} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 1.5 }}>
        <Field label="Amount" value={formatCurrency(detail.amount)} compact />
        <Field label="From Date" value={formatDate(detail.fromDate)} compact />
        <Field label="To Date" value={formatDate(detail.toDate)} compact />
        <Field label="Payment Mode" value={detail.paymentMode} compact />
        {detail.travelMode && <Field label="Travel Mode" value={detail.travelMode} compact />}
        {detail.fromLocation && <Field label="From Location" value={detail.fromLocation} compact />}
        {detail.toLocation && <Field label="To Location" value={detail.toLocation} compact />}
        <Field label="Employee Name" value={employeeName} compact />
        {showInitiatedBy && <Field label="Initiated By" value={detail.initiatedByEmpName} compact />}
      </Box>
      {detail.description && <Field label="Description" value={detail.description} compact />}
      <Box sx={{ mt: 1.5, mb: detail.status === 'Pending' ? 1.5 : 0 }}>
        <DetailBills expenseDetailId={detail.expenseDetailId} onView={onViewBill} />
      </Box>

      {detail.status === 'Pending' && (
        <Box sx={{ display: 'flex', gap: 1, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            size="small" variant="contained" color="success" fullWidth
            startIcon={<CheckCircleIcon />}
            disabled={isUpdating}
            onClick={() => onApprove(detail.approvalId)}
          >
            Approve
          </Button>
          <Button
            size="small" variant="contained" color="error" fullWidth
            startIcon={<CancelIcon />}
            disabled={isUpdating}
            onClick={() => onRejectClick(detail.approvalId)}
          >
            Reject
          </Button>
        </Box>
      )}
    </Paper>
  );
}

function ApprovalDrawerContent({
  empId, expense, initialTab,
}: {
  empId: string;
  expense: ApprovalExpenseSummary;
  initialTab?: number;
}) {
  const { role } = useAuthContext();
  const showInitiatedBy = role === 'ADMIN' || role === 'SUPERADMIN';
  const updateMutation = useUpdateApproval(empId);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectedReason, setRejectedReason] = useState('');
  const [rejectedReasonError, setRejectedReasonError] = useState('');
  const [tab, setTab] = useState(
    () => initialTab ?? (expense.pendingCount > 0 ? 0 : expense.approvedCount > 0 ? 1 : 2)
  );

  const tabs = [
    { label: 'Pending', count: expense.pendingCount, details: expense.pending },
    { label: 'Approved', count: expense.approvedCount, details: expense.approved },
    { label: 'Rejected', count: expense.rejectedCount, details: expense.rejected },
  ];
  const details = tabs[tab].details;

  const closeRejectDialog = () => {
    setRejectTarget(null);
    setRejectedReason('');
    setRejectedReasonError('');
  };

  const confirmReject = () => {
    if (!rejectedReason.trim()) { setRejectedReasonError('Reason is required'); return; }
    updateMutation.mutate(
      { approvalId: rejectTarget as number, status: 'Reject', rejectedReason: rejectedReason.trim() },
      { onSuccess: closeRejectDialog }
    );
  };

  return (
    <>
      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ px: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        {tabs.map((t, i) => (
          <Tab key={t.label} label={`${t.label} (${t.count})`} value={i} />
        ))}
      </Tabs>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        {details.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 5 }}>
            No {tabs[tab].label.toLowerCase()} items
          </Typography>
        ) : (
          details.map((detail) => (
            <DetailCard
              key={detail.expenseDetailId}
              detail={detail}
              employeeName={expense.empName}
              showInitiatedBy={showInitiatedBy}
              isUpdating={updateMutation.isPending}
              onViewBill={setViewerUrl}
              onApprove={(approvalId) => updateMutation.mutate({ approvalId, status: 'Approve' })}
              onRejectClick={setRejectTarget}
            />
          ))
        )}
        {viewerUrl && <BillViewerDialog open={!!viewerUrl} url={viewerUrl} onClose={() => setViewerUrl(null)} />}
      </Box>

      <Dialog open={rejectTarget !== null} onClose={closeRejectDialog} maxWidth="xs" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Reject Expense</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={3}
            fullWidth
            label="Reason for rejection"
            value={rejectedReason}
            onChange={(e) => { setRejectedReason(e.target.value); setRejectedReasonError(''); }}
            error={!!rejectedReasonError}
            helperText={rejectedReasonError}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeRejectDialog} disabled={updateMutation.isPending}>Cancel</Button>
          <Button
            variant="contained" color="error" onClick={confirmReject} disabled={updateMutation.isPending}
            startIcon={updateMutation.isPending ? <CircularProgress size={14} color="inherit" /> : <CancelIcon />}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export const ApprovalDrawer = ({ open, empId, expense, initialTab, onClose }: Props) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100vw', sm: 640 }, display: 'flex', flexDirection: 'column' } }}
    >
      <Box sx={{
        display: 'flex', alignItems: 'center', px: 2.5, py: 1.75,
        position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, flexShrink: 0,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>Expense Details</Typography>
        <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Divider sx={{ flexShrink: 0 }} />
      {expense && (
        <ApprovalDrawerContent key={expense.expenseId} empId={empId} expense={expense} initialTab={initialTab} />
      )}
    </Drawer>
  );
};
