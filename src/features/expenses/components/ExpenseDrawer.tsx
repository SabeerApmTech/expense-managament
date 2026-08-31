import {
  Drawer, Box, Typography, IconButton, Divider, Paper, Chip, Button, Tabs, Tab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CircleIcon from '@mui/icons-material/Circle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { useMemo, useState } from 'react';
import { ExpenseForm } from './ExpenseForm';
import { Field, FieldLabel } from '../../../components/common/Field';
import { BillViewerDialog } from '../../../components/common/BillViewerDialog';
import { DeleteConfirmDialog } from '../../../components/common/DeleteConfirmDialog';
import {
  useExpenseDetails, useExpenseBills, useCreateExpenseDetail,
  useUpdateExpenseDetail, useDeleteExpenseDetail, useDeleteBill,
} from '../hooks/useExpenses';
import { resolveBillUrl } from '../../../api/expenses.api';
import { resolveSettlementBillUrl } from '../../../api/accounts.api';
import { useAuthContext } from '../../../store/authStore';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import type { ExpenseDetailFormValues } from '../schemas/expense.schema';
import type { ExpenseDetailItem, ExpenseSummary } from '../../../types/expense.types';
import type { ExpenseCategory } from '../../../types/expenseType.types';

export type DrawerMode = 'add' | 'view' | null;

interface Props {
  mode: DrawerMode;
  category: ExpenseCategory;
  expense: ExpenseSummary | null;
  initialTab?: number;
  onClose: () => void;
}

function buildFormData(empId: string, expenseId: number | undefined, values: ExpenseDetailFormValues): FormData {
  const fd = new FormData();
  if (expenseId) fd.append('ExpenseId', String(expenseId));
  fd.append('EmpId', empId);
  fd.append('InitiatedByEmpId', values.initiatedByEmpId);
  fd.append('ExpenseTypeId', values.expenseTypeId);
  fd.append('Amount', String(values.amount));
  fd.append('FromDate', values.fromDate);
  fd.append('ToDate', values.toDate);
  fd.append('PaymentMode', values.paymentMode);
  fd.append('TravelMode', values.travelMode ?? '');
  fd.append('FromLocation', values.fromLocation ?? '');
  fd.append('ToLocation', values.toLocation ?? '');
  fd.append('Description', values.description ?? '');
  values.bills.forEach((f) => fd.append('Bills', f));
  return fd;
}

function DetailBills({
  empId, expenseId, expenseDetailId, canDelete, settlementBillPath, onView,
}: {
  empId: string;
  expenseId: number;
  expenseDetailId: number;
  canDelete: boolean;
  settlementBillPath?: string;
  onView: (url: string) => void;
}) {
  const { data: bills = [] } = useExpenseBills(expenseDetailId);
  const deleteBillMutation = useDeleteBill(empId, expenseId, expenseDetailId);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  if (!bills.length && !settlementBillPath) return null;

  return (
    <Box>
      <FieldLabel>Bills</FieldLabel>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
        {bills.map((bill, i) => (
          <Box
            key={bill.expenseBillId}
            sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 1 }}
          >
            <Button size="small" onClick={() => onView(resolveBillUrl(bill.bill))}>
              View Expense Bill{bills.length > 1 ? ` ${i + 1}` : ''}
            </Button>
            {canDelete && (
              <IconButton size="small" color="error" onClick={() => setDeleteTarget(bill.expenseBillId)} sx={{ mr: 0.25 }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        ))}
        {settlementBillPath && (
          <Box sx={{ display: 'flex', alignItems: 'center', border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Button size="small" onClick={() => onView(resolveSettlementBillUrl(settlementBillPath))}>
              View Settlement Bill
            </Button>
          </Box>
        )}
      </Box>
      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget != null) deleteBillMutation.mutate(deleteTarget, { onSuccess: () => setDeleteTarget(null) });
        }}
        isDeleting={deleteBillMutation.isPending}
        title="Delete Bill"
        message="Are you sure you want to delete this uploaded bill? This cannot be undone."
      />
    </Box>
  );
}

type StageState = 'done' | 'active' | 'rejected' | 'upcoming';

const STAGE_ICON: Record<StageState, React.ReactNode> = {
  done: <CheckCircleIcon fontSize="small" color="success" />,
  active: <CircleIcon fontSize="small" color="warning" />,
  rejected: <CancelIcon fontSize="small" color="error" />,
  upcoming: <RadioButtonUncheckedIcon fontSize="small" color="disabled" />,
};

const STAGE_TEXT_COLOR: Record<StageState, string> = {
  done: 'success.main',
  active: 'warning.main',
  rejected: 'error.main',
  upcoming: 'text.disabled',
};

// Mirrors a delivery-tracking view: Submitted is always reached, then Initiator and
// Admin approval stages progress left to right. atLevel identifies the current stage
// while Pending, or who acted while Rejected. Once Approved, a Settled stage is
// appended and driven by settlementStatus instead of a separate field/chip.
function getApprovalStages(
  status: string,
  atLevel: number | null,
  settlementStatus: string
): { label: string; state: StageState }[] {
  const level = atLevel == null ? 1 : atLevel;
  if (status === 'Rejected') {
    const rejectedAtInitiator = level <= 1;
    return [
      { label: 'Submitted', state: 'done' },
      { label: 'Initiator Approval', state: rejectedAtInitiator ? 'rejected' : 'done' },
      { label: 'Admin Approval', state: rejectedAtInitiator ? 'upcoming' : 'rejected' },
    ];
  }
  if (status === 'Approved') {
    return [
      { label: 'Submitted', state: 'done' },
      { label: 'Initiator Approval', state: 'done' },
      { label: 'Admin Approval', state: 'done' },
      { label: 'Settled', state: settlementStatus === 'Settled' ? 'done' : settlementStatus === 'Pending' ? 'active' : 'upcoming' },
    ];
  }
  return [
    { label: 'Submitted', state: 'done' },
    { label: 'Initiator Approval', state: level <= 1 ? 'active' : 'done' },
    { label: 'Admin Approval', state: level <= 1 ? 'upcoming' : 'active' },
  ];
}

function ApprovalTimeline({
  status, atLevel, settlementStatus,
}: {
  status: string;
  atLevel: number | null;
  settlementStatus: string;
}) {
  const stages = getApprovalStages(status, atLevel, settlementStatus);
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
      {stages.map((stage, i) => (
        <Box key={stage.label} sx={{ display: 'flex', alignItems: 'flex-start', flex: i < stages.length - 1 ? 1 : '0 0 auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 84 }}>
            {STAGE_ICON[stage.state]}
            <Typography
              variant="caption"
              sx={{ mt: 0.5, textAlign: 'center', fontWeight: stage.state === 'active' ? 700 : 500, color: STAGE_TEXT_COLOR[stage.state] }}
            >
              {stage.label}
            </Typography>
          </Box>
          {i < stages.length - 1 && (
            <Box sx={{ flex: 1, height: 2, bgcolor: stage.state === 'done' ? 'success.main' : 'divider', mt: 1.25, mx: 0.5 }} />
          )}
        </Box>
      ))}
    </Box>
  );
}

function DetailCard({
  detail, empId, expenseId, category, settlementBillPath, onViewBill,
}: {
  detail: ExpenseDetailItem;
  empId: string;
  expenseId: number;
  category: ExpenseCategory;
  settlementBillPath?: string;
  onViewBill: (url: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { data: bills = [] } = useExpenseBills(detail.expenseDetailId);
  const updateMutation = useUpdateExpenseDetail(empId, expenseId, detail.expenseDetailId);
  const deleteDetailMutation = useDeleteExpenseDetail(empId, expenseId);

  // Editable only while still awaiting the Initiator — once the Initiator has acted
  // (atLevel > 1), the item is locked from further edits/deletion.
  const isPending = detail.status === 'Pending' && (detail.atLevel ?? 1) <= 1;

  const handleDelete = () => {
    deleteDetailMutation.mutate(detail.expenseDetailId, { onSuccess: () => setDeleteOpen(false) });
  };

  if (editing) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Box sx={{ mb: 2 }}>
          <DetailBills
            empId={empId}
            expenseId={expenseId}
            expenseDetailId={detail.expenseDetailId}
            canDelete
            onView={onViewBill}
          />
        </Box>
        <ExpenseForm
          category={category}
          defaultValues={{
            initiatedByEmpId: detail.initiatedByEmpId,
            expenseTypeId: String(detail.expenseTypeId),
            amount: detail.amount,
            fromDate: detail.fromDate.slice(0, 10),
            toDate: detail.toDate.slice(0, 10),
            paymentMode: detail.paymentMode,
            travelMode: detail.travelMode ?? '',
            fromLocation: detail.fromLocation ?? '',
            toLocation: detail.toLocation ?? '',
            description: detail.description ?? '',
            bills: [],
          }}
          existingBillUrls={bills.map((b) => resolveBillUrl(b.bill))}
          submitLabel="Save"
          isSubmitting={updateMutation.isPending}
          onCancel={() => setEditing(false)}
          onSubmit={(values) => {
            updateMutation.mutate(
              { expenseDetailId: detail.expenseDetailId, formData: buildFormData(empId, undefined, values) },
              { onSuccess: () => setEditing(false) }
            );
          }}
        />
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{detail.expenseTypeName}</Typography>
        {isPending && (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <IconButton size="small" color="primary" onClick={() => setEditing(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => setDeleteOpen(true)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
      <ApprovalTimeline status={detail.status} atLevel={detail.atLevel} settlementStatus={detail.settlementStatus} />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 1.5 }}>
        <Field label="Amount" value={formatCurrency(detail.amount)} compact />
        <Field label="From Date" value={formatDate(detail.fromDate)} compact />
        <Field label="To Date" value={formatDate(detail.toDate)} compact />
        <Field label="Payment Mode" value={detail.paymentMode} compact />
        {detail.travelMode && <Field label="Travel Mode" value={detail.travelMode} compact />}
        {detail.fromLocation && <Field label="From Location" value={detail.fromLocation} compact />}
        {detail.toLocation && <Field label="To Location" value={detail.toLocation} compact />}
        <Field label="Initiated By" value={detail.initiatedByEmpName} compact />
      </Box>
      {detail.description && <Field label="Description" value={detail.description} compact />}
      {detail.status === 'Rejected' && detail.rejectedReason && (
        <Field label="Rejection Reason" value={detail.rejectedReason} compact />
      )}
      <Box sx={{ mt: 1.5 }}>
        <DetailBills
          empId={empId}
          expenseId={expenseId}
          expenseDetailId={detail.expenseDetailId}
          canDelete={false}
          settlementBillPath={detail.settlementStatus === 'Settled' ? settlementBillPath : undefined}
          onView={onViewBill}
        />
      </Box>

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={deleteDetailMutation.isPending}
        title="Delete Expense"
        message="Are you sure you want to delete this expense item? This cannot be undone."
      />
    </Paper>
  );
}

function AddItemToExpense({
  empId, expenseId, category, onDone,
}: {
  empId: string;
  expenseId: number;
  category: ExpenseCategory;
  onDone: () => void;
}) {
  const createMutation = useCreateExpenseDetail(empId, expenseId);

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Add Item</Typography>
      <ExpenseForm
        category={category}
        onSubmit={(values) => {
          createMutation.mutate(buildFormData(empId, expenseId, values), { onSuccess: onDone });
        }}
        isSubmitting={createMutation.isPending}
        submitLabel="Add"
        onCancel={onDone}
      />
    </Paper>
  );
}

function ViewContent({
  empId, expense, category, initialTab,
}: {
  empId: string;
  expense: ExpenseSummary;
  category: ExpenseCategory;
  initialTab?: number;
}) {
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [addingItem, setAddingItem] = useState(false);
  const [tab, setTab] = useState(
    () => initialTab ?? (expense.pendingCount > 0 ? 0 : expense.approvedCount > 0 ? 1 : 2)
  );

  // The embedded pending/approved/rejected arrays from the list endpoint don't carry
  // settlementBill — only the per-expense details endpoint does — so look it up there,
  // keyed by expenseDetailId, once per opened expense.
  const { data: expenseDetails } = useExpenseDetails(empId, expense.expenseId);
  const settlementBillByDetailId = useMemo(() => {
    const map = new Map<number, string>();
    (expenseDetails ?? []).forEach((d) => {
      if (d.settlementBill?.settlementBillPath) map.set(d.expenseDetailId, d.settlementBill.settlementBillPath);
    });
    return map;
  }, [expenseDetails]);

  const tabs = [
    { label: 'Pending', count: expense.pendingCount, details: expense.pending },
    { label: 'Approved', count: expense.approvedCount, details: expense.approved },
    { label: 'Rejected', count: expense.rejectedCount, details: expense.rejected },
  ];
  const details = tabs[tab].details;

  // Once the Initiator has acted on any item in this expense, it's locked from
  // further additions too.
  const canAddItem = expense.approvedCount === 0 && expense.rejectedCount === 0
    && expense.pending.every((d) => (d.atLevel ?? 1) <= 1);

  return (
    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ px: 2.5, flexShrink: 0, borderBottom: '1px solid', borderColor: 'divider' }}>
        {tabs.map((t, i) => (
          <Tab key={t.label} label={`${t.label} (${t.count})`} value={i} />
        ))}
      </Tabs>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        {addingItem ? (
          <AddItemToExpense empId={empId} expenseId={expense.expenseId} category={category} onDone={() => setAddingItem(false)} />
        ) : canAddItem ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <IconButton
              size="small"
              color="primary"
              title="Add another item to this expense"
              onClick={() => setAddingItem(true)}
              sx={{ border: '1px solid', borderColor: 'primary.main' }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : null}
        {details.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 5 }}>
            No {tabs[tab].label.toLowerCase()} items
          </Typography>
        ) : (
          details.map((detail) => (
            <DetailCard
              key={detail.expenseDetailId}
              detail={detail}
              empId={empId}
              expenseId={expense.expenseId}
              category={category}
              settlementBillPath={settlementBillByDetailId.get(detail.expenseDetailId)}
              onViewBill={setViewerUrl}
            />
          ))
        )}
        {viewerUrl && <BillViewerDialog open={!!viewerUrl} url={viewerUrl} onClose={() => setViewerUrl(null)} />}
      </Box>
    </Box>
  );
}

function AddContent({
  empId, category, onClose,
}: {
  empId: string;
  category: ExpenseCategory;
  onClose: () => void;
}) {
  const [expenseId, setExpenseId] = useState<number | undefined>(undefined);
  const [formKey, setFormKey] = useState(0);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const { data: details = [], isLoading: isLoadingDetails } = useExpenseDetails(empId, expenseId);

  // If every item just added under this expenseId gets deleted (back to zero items),
  // treat it as if nothing was created yet, so the next submit starts a genuinely
  // fresh expense instead of silently re-attaching to the now-empty one.
  const effectiveExpenseId = !isLoadingDetails && details.length === 0 ? undefined : expenseId;
  const createMutation = useCreateExpenseDetail(empId, effectiveExpenseId);

  const runningTotal = details.reduce((sum, d) => sum + d.amount, 0);

  const handleSubmit = (values: ExpenseDetailFormValues) => {
    createMutation.mutate(buildFormData(empId, effectiveExpenseId, values), {
      onSuccess: (result) => {
        if (!effectiveExpenseId) setExpenseId(result.data.expenseId);
        setFormKey((k) => k + 1);
      },
    });
  };

  return (
    <Box sx={{ p: 2.5 }}>
      {details.length > 0 && (
        <>
          <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{details[0].expenseCode}</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Total: {formatCurrency(runningTotal)}</Typography>
          </Paper>
          {details.map((detail) => (
            <DetailCard
              key={detail.expenseDetailId}
              detail={detail}
              empId={empId}
              expenseId={expenseId as number}
              category={category}
              onViewBill={setViewerUrl}
            />
          ))}
        </>
      )}
      <ExpenseForm
        key={formKey}
        category={category}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitLabel={details.length > 0 ? 'Add Another Item' : 'Submit'}
        onCancel={onClose}
      />
      {details.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Chip label="Done — Close" color="primary" onClick={onClose} sx={{ fontWeight: 700, px: 1 }} />
        </Box>
      )}
      {viewerUrl && <BillViewerDialog open={!!viewerUrl} url={viewerUrl} onClose={() => setViewerUrl(null)} />}
    </Box>
  );
}

const TITLE: Record<string, string> = { add: 'Add Expense', view: 'Expense Details' };

export const ExpenseDrawer = ({ mode, category, expense, initialTab, onClose }: Props) => {
  const { user } = useAuthContext();
  const empId = user?.empId ?? '';

  return (
    <Drawer
      anchor="right"
      open={mode !== null}
      onClose={onClose}
      sx={{ '& .MuiDrawer-paper': { width: { xs: '100vw', sm: 640 }, display: 'flex', flexDirection: 'column' } }}
    >
      <Box sx={{
        display: 'flex', alignItems: 'center', px: 2.5, py: 1.75,
        position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1, flexShrink: 0,
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
          {mode ? TITLE[mode] : ''}
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ ml: 1 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Divider sx={{ flexShrink: 0 }} />
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {mode === 'view' && expense && (
          <ViewContent key={expense.expenseId} empId={empId} expense={expense} category={category} initialTab={initialTab} />
        )}
        {mode === 'add' && (
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <AddContent empId={empId} category={category} onClose={onClose} />
          </Box>
        )}
      </Box>
    </Drawer>
  );
};
