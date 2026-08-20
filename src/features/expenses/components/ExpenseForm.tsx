import {
  Grid, Button, Box, CircularProgress, Typography, IconButton, Alert,
} from '@mui/material';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef } from 'react';
import dayjs from 'dayjs';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { FormSelect } from '../../../components/forms/FormSelect';
import { FormDatePicker } from '../../../components/forms/FormDatePicker';
import { FormTextField } from '../../../components/forms/FormTextField';
import { useInitiators } from '../hooks/useInitiators';
import { useExpenseTypeUsage } from '../hooks/useExpenseTypeUsage';
import { PAYMENT_MODE_OPTIONS, TRAVEL_MODE_OPTIONS, EXPENSE_CATEGORY_OPTIONS, isTravelExpenseType } from '../../../constants/masterData';
import { expenseDetailSchema, type ExpenseDetailFormValues } from '../schemas/expense.schema';
import { useAuthContext } from '../../../store/authStore';
import { formatCurrency } from '../../../utils/formatters';

interface Props {
  defaultValues?: Partial<ExpenseDetailFormValues>;
  existingBillUrls?: string[];
  onSubmit: (values: ExpenseDetailFormValues) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
}

const DEFAULT_VALUES: ExpenseDetailFormValues = {
  initiatedByEmpId: '',
  expenseTypeId: '',
  amount: 0,
  fromDate: '',
  toDate: '',
  paymentMode: '',
  travelMode: '',
  fromLocation: '',
  toLocation: '',
  description: '',
  bills: [],
};

function BillsFileUpload() {
  const { setValue, watch, clearErrors, formState: { errors } } = useFormContext<ExpenseDetailFormValues>();
  const files: File[] = watch('bills') ?? [];
  const billError = errors.bills?.message as string | undefined;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length) {
      setValue('bills', [...files, ...selected]);
      clearErrors('bills');
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (fi: number) => {
    setValue('bills', files.filter((_, i) => i !== fi));
  };

  return (
    <Box>
      <input
        ref={inputRef} type="file" multiple accept="image/*,application/pdf"
        style={{ display: 'none' }} onChange={handleChange}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: files.length ? 1 : 0 }}>
        {files.map((f, fi) => (
          <Box key={fi} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, border: 1, borderColor: 'primary.main', borderRadius: 1 }}>
            <AttachFileIcon fontSize="small" color="primary" />
            <Typography variant="caption" sx={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {f.name}
            </Typography>
            <IconButton size="small" onClick={() => removeFile(fi)} sx={{ p: 0.25 }}>
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          </Box>
        ))}
      </Box>
      <Button
        variant="outlined" size="small" startIcon={<AttachFileIcon />}
        onClick={() => inputRef.current?.click()}
        color={billError ? 'error' : 'primary'}
      >
        {files.length ? 'Add More Bills' : 'Upload Bill'}
      </Button>
      {billError && (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'error.main' }}>
          {billError}
        </Typography>
      )}
    </Box>
  );
}

interface FormFieldsProps {
  originalExpenseTypeId?: string;
  originalAmount?: number;
}

function FormFields({ originalExpenseTypeId, originalAmount = 0 }: FormFieldsProps) {
  const { watch } = useFormContext<ExpenseDetailFormValues>();
  const { user } = useAuthContext();
  const { data: initiators = [], isLoading: loadingInitiators } = useInitiators();
  const { data: usage = [], isLoading: loadingTypes } = useExpenseTypeUsage(user?.empId);
  const expenseTypeId = watch('expenseTypeId');
  const amount = watch('amount');
  const fromDate = watch('fromDate');

  // Only expense types the employee has an assigned limit for are selectable; one
  // whose monthly limit is already used up is shown but disabled (unless it's the
  // type being edited, whose own prior amount is added back before checking).
  const expenseTypeOptions = [...usage]
    .sort((a, b) => EXPENSE_CATEGORY_OPTIONS.indexOf(a.expenseCategory) - EXPENSE_CATEGORY_OPTIONS.indexOf(b.expenseCategory))
    .map((t) => {
      const isEditingSameType = originalExpenseTypeId != null && originalExpenseTypeId === String(t.expenseTypeId);
      const remaining = t.remainingAmount + (isEditingSameType ? originalAmount : 0);
      return {
        value: String(t.expenseTypeId),
        label: t.expenseTypeName,
        group: t.expenseCategory,
        disabled: remaining <= 0,
        disabledReason: remaining <= 0 ? 'Limit reached' : undefined,
      };
    });
  const selectedUsage = usage.find((u) => String(u.expenseTypeId) === expenseTypeId);
  const isTravel = isTravelExpenseType(selectedUsage?.expenseTypeName);

  // If editing an item of this same type, its own amount is already counted as "spent" —
  // add it back so editing doesn't get blocked by its own prior submission.
  const isEditingSameType = originalExpenseTypeId != null && originalExpenseTypeId === expenseTypeId;
  const effectiveRemaining = selectedUsage
    ? selectedUsage.remainingAmount + (isEditingSameType ? originalAmount : 0)
    : undefined;
  const amountExceedsLimit = effectiveRemaining != null && Number(amount) > effectiveRemaining;

  const initiatorOptions = initiators
    .filter((i) => i.empId !== user?.empId)
    .map((i) => ({ value: i.empId, label: i.empName }));

  const monthStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const today = dayjs().format('YYYY-MM-DD');

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormSelect name="initiatedByEmpId" label="Initiator" options={initiatorOptions} disabled={loadingInitiators} required />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormSelect name="expenseTypeId" label="Expense Type" options={expenseTypeOptions} disabled={loadingTypes} required />
      </Grid>
      {selectedUsage && (
        <Grid size={{ xs: 12 }}>
          <Alert severity={effectiveRemaining! <= 0 || amountExceedsLimit ? 'error' : 'info'} sx={{ py: 0.5 }}>
            Monthly limit for {selectedUsage.expenseTypeName}: {formatCurrency(selectedUsage.limitAmount)}{' '}
            (Settled: {formatCurrency(selectedUsage.settledAmount)} · Pending: {formatCurrency(selectedUsage.pendingAmount)}) ·{' '}
            <strong>Remaining: {formatCurrency(effectiveRemaining!)}</strong>
            {amountExceedsLimit && (
              <> — amount exceeds remaining limit by <strong>{formatCurrency(Number(amount) - effectiveRemaining!)}</strong></>
            )}
          </Alert>
        </Grid>
      )}
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormTextField name="amount" label="Amount (₹)" type="number" required />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormDatePicker name="fromDate" label="From Date" required minDate={monthStart} maxDate={today} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormDatePicker name="toDate" label="To Date" required minDate={fromDate || monthStart} maxDate={today} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <FormSelect name="paymentMode" label="Payment Mode" options={PAYMENT_MODE_OPTIONS} required />
      </Grid>
      {isTravel && (
        <>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect name="travelMode" label="Travel Mode" options={TRAVEL_MODE_OPTIONS} required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField name="fromLocation" label="From Location" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField name="toLocation" label="To Location" required />
          </Grid>
        </>
      )}
      <Grid size={{ xs: 12 }}>
        <FormTextField name="description" label="Description" multiline rows={2} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <BillsFileUpload />
      </Grid>
    </Grid>
  );
}

export const ExpenseForm = ({
  defaultValues, existingBillUrls, onSubmit, isSubmitting, onCancel, submitLabel = 'Submit',
}: Props) => {
  const { user } = useAuthContext();
  const { data: usage = [] } = useExpenseTypeUsage(user?.empId);
  const originalExpenseTypeId = defaultValues?.expenseTypeId;
  const originalAmount = defaultValues?.amount ?? 0;

  const methods = useForm<ExpenseDetailFormValues>({
    resolver: zodResolver(expenseDetailSchema),
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
  });

  const handleValidatedSubmit = (values: ExpenseDetailFormValues) => {
    if (values.bills.length === 0 && !existingBillUrls?.length) {
      methods.setError('bills', { type: 'manual', message: 'Please upload at least one bill' });
      return;
    }

    const selectedUsage = usage.find((u) => String(u.expenseTypeId) === values.expenseTypeId);
    if (selectedUsage) {
      const isEditingSameType = originalExpenseTypeId != null && originalExpenseTypeId === values.expenseTypeId;
      const effectiveRemaining = selectedUsage.remainingAmount + (isEditingSameType ? originalAmount : 0);
      if (values.amount > effectiveRemaining) {
        methods.setError('amount', {
          type: 'manual',
          message: `Amount exceeds your remaining monthly limit of ${formatCurrency(effectiveRemaining)} for ${selectedUsage.expenseTypeName}`,
        });
        return;
      }
    }

    onSubmit(values);
  };

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={methods.handleSubmit(handleValidatedSubmit)} noValidate>
        <FormFields originalExpenseTypeId={originalExpenseTypeId} originalAmount={originalAmount} />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
          {onCancel && (
            <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ minWidth: 120 }}>
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : submitLabel}
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};
