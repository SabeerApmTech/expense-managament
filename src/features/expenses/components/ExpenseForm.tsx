import { Grid, Button, Box, CircularProgress, Typography, TextField } from '@mui/material';
import { FormProvider, useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useRef } from 'react';
import { FormTextField } from '../../../components/forms/FormTextField';
import { FormSelect } from '../../../components/forms/FormSelect';
import { FormDatePicker } from '../../../components/forms/FormDatePicker';
import { FileUpload } from '../../../components/common/FileUpload';
import { useExpenseTypes, useTravelModes, usePayModes, useExpensePageLoad } from '../hooks/useMasterData';
import { expenseSchema, type ExpenseFormValues } from '../schemas/expense.schema';
import type { SelectOption } from '../../../types/common.types';

interface Props {
  defaultValues?: Partial<ExpenseFormValues>;
  existingBillUrl?: string | null;
  onSubmit: (values: ExpenseFormValues, attachment: File | null) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const ExpenseForm = ({ defaultValues, existingBillUrl, onSubmit, isSubmitting, onCancel }: Props) => {
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState('');
  const [rangeError, setRangeError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { data: pageLoad } = useExpensePageLoad();
  const { data: expenseTypes = [], isLoading: loadingTypes } = useExpenseTypes();
  const { data: travelModes = [], isLoading: loadingTravel } = useTravelModes();
  const { data: payModes = [], isLoading: loadingPay } = usePayModes();

  const expenseTypeOptions: SelectOption[] = pageLoad?.expenseTypes.length
    ? pageLoad.expenseTypes.map((t) => ({ value: String(t.expenseTypeId), label: t.expenseTypeName }))
    : expenseTypes.map((t) => ({ value: String(t.id), label: t.name }));

  const payModeOptions: SelectOption[] = pageLoad?.paymentModes.length
    ? pageLoad.paymentModes.map((p) => ({ value: String(p.paymentModeId), label: p.paymentModeName }))
    : payModes.map((p) => ({ value: String(p.id), label: p.name }));

  const travelModeOptions: SelectOption[] = pageLoad?.travelModes.length
    ? pageLoad.travelModes.map((t) => ({ value: String(t.travelModeId), label: t.travelModeName }))
    : travelModes.map((t) => ({ value: String(t.id), label: t.name }));

  const methods = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expenseTypeId: '',
      description: '',
      fromDate: '',
      toDate: '',
      amount: 0,
      payModeId: '',
      travelModeId: '',
      fromLocation: '',
      toLocation: '',
      initiatedBy: '',
      ...defaultValues,
    },
  });

  const watchedTypeId = methods.watch('expenseTypeId');

  // Clear range error whenever expense type changes
  useEffect(() => {
    clearTimeout(debounceRef.current);
    setRangeError('');
  }, [watchedTypeId]);

  // Keep a ref to selectedPageLoadType so the onChange closure always reads fresh data
  const selectedPageLoadType = pageLoad?.expenseTypes.find(
    (t) => String(t.expenseTypeId) === watchedTypeId,
  );
  const selectedTypeRef = useRef(selectedPageLoadType);
  selectedTypeRef.current = selectedPageLoadType;

  const validateAmount = (value: number) => {
    clearTimeout(debounceRef.current);
    const type = selectedTypeRef.current;

    if (!type || !value) {
      setRangeError('');
      return;
    }

    if (value <= type.toRange) {
      // Within or below the max limit — clear immediately
      setRangeError('');
    } else {
      // Exceeds the upper limit — debounce so it doesn't flash while typing
      const msg = `Must not exceed ₹${type.toRange.toLocaleString('en-IN')}`;
      debounceRef.current = setTimeout(() => setRangeError(msg), 600);
    }
  };

  const allowedHint = selectedPageLoadType
    ? `Max allowed: ₹${selectedPageLoadType.toRange.toLocaleString('en-IN')}`
    : undefined;

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={methods.handleSubmit((v) => {
        if (!attachment && !existingBillUrl) {
          setAttachmentError('Bill attachment is required');
          return;
        }
        const type = selectedTypeRef.current;
        if (type && v.amount && v.amount > type.toRange) {
          setRangeError(`Must not exceed ₹${type.toRange.toLocaleString('en-IN')}`);
          return;
        }
        onSubmit(v, attachment);
      })} noValidate>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect
              name="expenseTypeId"
              label="Expense Type"
              options={expenseTypeOptions}
              disabled={loadingTypes}
              required
            />
          </Grid>

          {/* Amount — custom Controller so rangeError can control the field state directly */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="amount"
              control={methods.control}
              render={({ field, fieldState }) => {
                const hasError = !!fieldState.error || !!rangeError;
                const helperText = fieldState.error?.message || rangeError || allowedHint;
                return (
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, color: 'text.primary' }}>
                      Amount (₹)
                      <Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>*</Box>
                    </Typography>
                    <TextField
                      type="number"
                      size="small"
                      fullWidth
                      hiddenLabel
                      error={hasError}
                      helperText={helperText}
                      slotProps={{
                        formHelperText: {
                          sx: { color: hasError ? 'error.main' : 'text.secondary' },
                        },
                      }}
                      value={field.value === 0 || field.value == null ? '' : field.value}
                      onBlur={field.onBlur}
                      onChange={(e) => {
                        const parsed = parseFloat(e.target.value);
                        const value = isNaN(parsed) ? 0 : parsed;
                        field.onChange(value);
                        validateAmount(value);
                      }}
                    />
                  </Box>
                );
              }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <FormTextField name="description" label="Description" multiline rows={3} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormDatePicker name="fromDate" label="From Date" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormDatePicker name="toDate" label="To Date" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect name="payModeId" label="Pay Mode" options={payModeOptions} disabled={loadingPay} required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormSelect name="travelModeId" label="Travel Mode" options={travelModeOptions} disabled={loadingTravel} required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField name="fromLocation" label="From Location" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField name="toLocation" label="To Location" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormTextField name="initiatedBy" label="Initiated By" required />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FileUpload
              value={attachment}
              onChange={(f) => { setAttachment(f); if (f) setAttachmentError(''); }}
              existingFileUrl={existingBillUrl}
              label="Upload Bill (PDF/Image)"
              error={attachmentError}
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
          {onCancel && (
            <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ minWidth: 120 }}>
            {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Submit'}
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};
