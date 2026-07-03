import {
  Grid, Button, Box, CircularProgress, Typography, TextField,
  Paper, IconButton, Divider, Autocomplete, Alert,
} from '@mui/material';
import { FormProvider, useForm, useFieldArray, Controller, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { FormSelect } from '../../../components/forms/FormSelect';
import { FormDatePicker } from '../../../components/forms/FormDatePicker';
import { FormTextField } from '../../../components/forms/FormTextField';
import { useExpenseTypes, usePayModes, useTravelModes, useExpensePageLoad } from '../hooks/useMasterData';
import { useExpenseList } from '../hooks/useExpenses';
import { useDesignationExpenseMaps, useDesignationTravelMaps, useEmployees } from '../../admin/hooks/useAdminMaster';
import { getStoredAuth } from '../../../store/authStore';
import { isRejected } from '../../../constants/masterData';
import { expenseSchema, type ExpenseFormValues } from '../schemas/expense.schema';
import type { SelectOption } from '../../../types/common.types';

interface Props {
  defaultValues?: Partial<ExpenseFormValues>;
  existingBillUrls?: (string | null | undefined)[];
  excludeExpenseId?: string | number;
  onSubmit: (values: ExpenseFormValues) => void;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

const DEFAULT_ITEM = {
  initiatedBy: '',
  expenseTypeId: '',
  description: '',
  fromDate: '',
  toDate: '',
  amount: 0 as number,
  payModeId: '',
  travelModeId: '',
  areaFrom: '',
  areaTo: '',
  billFiles: [] as File[],
};

// ─── Per-item file upload (inline) ───────────────────────────────────────────

interface ItemFileUploadProps {
  index: number;
  existingBillUrl?: string | null;
}

const ItemFileUpload = ({ index, existingBillUrl }: ItemFileUploadProps) => {
  const { setValue, watch, formState: { errors } } = useFormContext<ExpenseFormValues>();
  const files: File[] = watch(`items.${index}.billFiles`) ?? [];
  const billError = (errors.items?.[index] as { billFiles?: { message?: string } })?.billFiles?.message;
  const amount = watch(`items.${index}.amount`) ?? 0;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length) setValue(`items.${index}.billFiles`, [...files, ...selected]);
    if (inputRef.current) inputRef.current.value = '';
  };

  const removeFile = (fi: number) => {
    setValue(`items.${index}.billFiles`, files.filter((_, i) => i !== fi));
  };

  const existingName = existingBillUrl
    ? decodeURIComponent(existingBillUrl.split('/').pop() ?? 'Uploaded file')
    : null;

  return (
    <Box>
      <input
        ref={inputRef} type="file" multiple accept="image/*,application/pdf"
        style={{ display: 'none' }} onChange={handleChange}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: files.length || existingBillUrl ? 1 : 0 }}>
        {existingBillUrl && files.length === 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <AttachFileIcon fontSize="small" color="success" />
            <Typography
              component="a" href={existingBillUrl} target="_blank" rel="noreferrer"
              variant="caption" sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {existingName}
            </Typography>
          </Box>
        )}
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
        {files.length || existingBillUrl ? 'Add More Bills' : 'Upload Bill *'}
      </Button>
      {billError && (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'error.main' }}>
          {billError}
        </Typography>
      )}
      {amount > 5000 && (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: 'warning.main', fontWeight: 500 }}>
          Upload GST if amount exceeds Rs 5000
        </Typography>
      )}
    </Box>
  );
};

// ─── Per-item amount field with range validation ──────────────────────────────

interface AmountFieldProps {
  index: number;
  expenseTypeOptions: (SelectOption & { fromRange?: number; toRange?: number })[];
}

const AmountField = ({ index, expenseTypeOptions }: AmountFieldProps) => {
  const { control, watch } = useFormContext<ExpenseFormValues>();
  const watchedTypeId = watch(`items.${index}.expenseTypeId`);
  const selectedType = expenseTypeOptions.find(o => o.value === watchedTypeId);
  const allowedHint = selectedType?.toRange != null ? `Max: ₹${selectedType.toRange.toLocaleString('en-IN')}` : undefined;

  return (
    <Controller
      name={`items.${index}.amount`}
      control={control}
      render={({ field, fieldState }) => {
        const rangeExceeded = selectedType?.toRange != null && field.value > selectedType.toRange;
        const hasError = !!fieldState.error || rangeExceeded;
        const helperText = fieldState.error?.message
          || (rangeExceeded ? `Must not exceed ₹${selectedType!.toRange!.toLocaleString('en-IN')}` : allowedHint);
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, color: 'text.primary' }}>
              Amount (₹)<Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>*</Box>
            </Typography>
            <TextField
              type="number" size="small" fullWidth hiddenLabel
              error={hasError}
              helperText={helperText}
              slotProps={{ formHelperText: { sx: { color: hasError ? 'error.main' : 'text.secondary' } } }}
              value={field.value === 0 || field.value == null ? '' : field.value}
              onBlur={field.onBlur}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              onChange={(e) => {
                const parsed = parseFloat(e.target.value);
                field.onChange(isNaN(parsed) ? 0 : parsed);
              }}
            />
          </Box>
        );
      }}
    />
  );
};

// ─── Per-item category alert ──────────────────────────────────────────────────

type ExpTypeOption = SelectOption & {
  fromRange?: number;
  toRange?: number;
  spent?: number;
  disabled?: boolean;
  disabledReason?: string;
};

const CATEGORY_MESSAGES: Record<string, string> = {
  travel:
    'Travel expenses are reimbursable only for official trips conducted outside your home state on company business. Personal travel is not eligible for reimbursement.',
  food:
    'Food expenses are reimbursable only when incurred during official company-related activities or business engagements. Personal meals and social occasions are not covered.',
  office:
    'Office materials are reimbursable only when purchased on behalf of the company for official use. Please retain all original receipts as proof of purchase.',
  stationery:
    'Stationery items are reimbursable only when procured on behalf of the company for official purposes. Personal stationery purchases are not eligible.',
};

const DEFAULT_CATEGORY_MESSAGE =
  'This expense is reimbursable only when incurred strictly for official company-related purposes. Personal expenses of any nature are not eligible for reimbursement.';

interface CategoryAlertProps { index: number; expenseTypeOptions: ExpTypeOption[]; }

const CategoryAlert = ({ index, expenseTypeOptions }: CategoryAlertProps) => {
  const { watch } = useFormContext<ExpenseFormValues>();
  const expenseTypeId = watch(`items.${index}.expenseTypeId`);
  if (!expenseTypeId) return null;
  const selectedType = expenseTypeOptions.find(o => o.value === expenseTypeId);
  const label = (selectedType?.label ?? '').toLowerCase();
  const message = CATEGORY_MESSAGES[label] ?? DEFAULT_CATEGORY_MESSAGE;

  if (selectedType?.disabled) {
    return (
      <Alert severity="warning" sx={{ mb: 0.5, py: 0.5, fontSize: 13 }}>
        Monthly limit for "{selectedType.label}" has already been used up
        (₹{(selectedType.spent ?? 0).toLocaleString('en-IN')} of ₹{(selectedType.toRange ?? 0).toLocaleString('en-IN')}
        {' '}this month). This category cannot be selected until next month.
      </Alert>
    );
  }

  const remaining = selectedType?.toRange != null ? selectedType.toRange - (selectedType.spent ?? 0) : undefined;
  return (
    <Alert severity="info" sx={{ mb: 0.5, py: 0.5, fontSize: 13 }}>
      {message}
      {remaining != null && (
        <>{' '}Remaining monthly limit for this category: ₹{remaining.toLocaleString('en-IN')}.</>
      )}
    </Alert>
  );
};

// ─── Per-item card (needs own hooks for conditional rendering) ────────────────

interface ExpenseItemCardProps {
  index: number;
  expenseTypeOptions: ExpTypeOption[];
  payModeOptions: SelectOption[];
  travelModeOptions: SelectOption[];
  employees: { id: string; name: string }[];
  loadingTypes: boolean;
  loadingPay: boolean;
  loadingTravel: boolean;
  loadingDesignationExpenseMaps: boolean;
  existingBillUrl?: string | null;
  onRemove?: () => void;
  showRemove: boolean;
}

const ExpenseItemCard = ({
  index, expenseTypeOptions, payModeOptions, travelModeOptions, employees,
  loadingTypes, loadingPay, loadingTravel, loadingDesignationExpenseMaps,
  existingBillUrl, onRemove, showRemove,
}: ExpenseItemCardProps) => {
  const { control, watch } = useFormContext<ExpenseFormValues>();
  const expenseTypeId = watch(`items.${index}.expenseTypeId`);
  const fromDate = watch(`items.${index}.fromDate`);
  const categoryLabel = (expenseTypeOptions.find(o => o.value === expenseTypeId)?.label ?? '').toLowerCase();
  const isTravel = categoryLabel === 'travel';

  return (
    <Paper variant="outlined" sx={{ p: 2.5, mb: 2, borderRadius: 2, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Expense Item {showRemove ? `#${index + 1}` : ''}
        </Typography>
        {showRemove && (
          <IconButton size="small" color="error" onClick={onRemove}>
            <DeleteForeverIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name={`items.${index}.initiatedBy`}
            control={control}
            render={({ field, fieldState }) => (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, color: 'text.primary' }}>
                  Initiated By<Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>*</Box>
                </Typography>
                <Autocomplete
                  options={employees}
                  getOptionLabel={(o) => o.name}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  value={employees.find(e => e.id === field.value) ?? null}
                  onChange={(_, v) => field.onChange(v?.id ?? '')}
                  renderInput={(params) => (
                    <TextField {...params} size="small" hiddenLabel placeholder="Select Employee"
                      error={!!fieldState.error} helperText={fieldState.error?.message} />
                  )}
                />
              </Box>
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect name={`items.${index}.expenseTypeId`} label="Category"
            options={expenseTypeOptions} disabled={loadingTypes || loadingDesignationExpenseMaps} required />
        </Grid>
        {expenseTypeId && (
          <Grid size={{ xs: 12 }}>
            <CategoryAlert index={index} expenseTypeOptions={expenseTypeOptions} />
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 6 }}>
          <AmountField index={index} expenseTypeOptions={expenseTypeOptions} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormDatePicker name={`items.${index}.fromDate`} label="From Date" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormDatePicker name={`items.${index}.toDate`} label="To Date" required minDate={fromDate || undefined} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect name={`items.${index}.payModeId`} label="Pay Mode" options={payModeOptions} disabled={loadingPay} required />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormSelect
            name={`items.${index}.travelModeId`}
            label="Travel Mode"
            options={travelModeOptions}
            disabled={loadingTravel}
            required={isTravel}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            name={`items.${index}.areaFrom`}
            label="From Location"
            required={isTravel}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormTextField
            name={`items.${index}.areaTo`}
            label="To Location"
            required={isTravel}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <FormTextField name={`items.${index}.description`} label="Description" multiline rows={2} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ mb: 1 }} />
          <ItemFileUpload index={index} existingBillUrl={existingBillUrl} />
        </Grid>
      </Grid>
    </Paper>
  );
};

// ─── Main form ────────────────────────────────────────────────────────────────

export const ExpenseForm = ({ defaultValues, existingBillUrls, excludeExpenseId, onSubmit, isSubmitting, onCancel }: Props) => {
  const { data: pageLoad } = useExpensePageLoad();
  const { data: expenseTypes = [], isLoading: loadingTypes } = useExpenseTypes();
  const { data: payModes = [], isLoading: loadingPay } = usePayModes();
  const { data: travelModes = [], isLoading: loadingTravel } = useTravelModes();
  const { data: designationExpenseMaps = [], isLoading: loadingDesignationExpenseMaps } = useDesignationExpenseMaps();
  const { data: designationTravelMaps = [] } = useDesignationTravelMaps();
  const { data: allEmployees = [] } = useEmployees();

  const monthStart = dayjs().startOf('month').format('YYYY-MM-DD');
  const monthEnd = dayjs().endOf('month').format('YYYY-MM-DD');
  const { data: monthlyExpenses } = useExpenseList({ fromDate: monthStart, toDate: monthEnd });

  // Amount already submitted this month per expense type, excluding rejected claims
  // and the expense currently being edited (its own prior amount shouldn't count against itself).
  const spentByType = useMemo(() => {
    const totals: Record<number, number> = {};
    (monthlyExpenses?.data ?? []).forEach(exp => {
      if (excludeExpenseId != null && String(exp.id) === String(excludeExpenseId)) return;
      if (isRejected(exp.status)) return;
      (exp.details ?? []).forEach(d => {
        totals[d.expenseTypeId] = (totals[d.expenseTypeId] ?? 0) + d.amount;
      });
    });
    return totals;
  }, [monthlyExpenses, excludeExpenseId]);

  const currentUserId = getStoredAuth()?.id;
  const employees = allEmployees.filter(e => e.id !== currentUserId);

  const userDesignationId = pageLoad?.designationId;

  const userExpenseMaps = designationExpenseMaps.filter(m => m.designationId === userDesignationId);
  const mappedExpenseTypeIds = new Set(userExpenseMaps.map(m => m.expenseTypeId));

  const buildTypeOption = (id: number, label: string, toRange?: number, fromRange?: number): ExpTypeOption => {
    const spent = spentByType[id] ?? 0;
    const limitReached = toRange != null && spent >= toRange;
    return {
      value: String(id),
      label,
      fromRange,
      toRange,
      spent,
      disabled: limitReached,
      disabledReason: limitReached ? 'Monthly limit reached' : undefined,
    };
  };

  const expenseTypeOptions: ExpTypeOption[] = pageLoad?.expenseTypes.length
    ? pageLoad.expenseTypes
      .filter(t => mappedExpenseTypeIds.has(t.expenseTypeId))
      .map(t => {
        const map = userExpenseMaps.find(m => m.expenseTypeId === t.expenseTypeId);
        return buildTypeOption(t.expenseTypeId, t.expenseTypeName, map?.amountRangeTo, map?.amountRangeFrom);
      })
    : expenseTypes
      .filter(t => mappedExpenseTypeIds.has(t.id))
      .map(t => {
        const map = userExpenseMaps.find(m => m.expenseTypeId === t.id);
        return buildTypeOption(t.id, t.name, map?.amountRangeTo, map?.amountRangeFrom);
      });

  const userTravelMaps = designationTravelMaps.filter(m => m.designationId === userDesignationId);
  const mappedTravelModeIds = new Set(
    userTravelMaps.flatMap(m =>
      m.travelModeId.toString().split(',').map(id => Number(id.trim())).filter(Boolean)
    )
  );

  const payModeOptions: SelectOption[] = pageLoad?.paymentModes.length
    ? pageLoad.paymentModes.map(p => ({ value: String(p.paymentModeId), label: p.paymentModeName }))
    : payModes.map(p => ({ value: String(p.id), label: p.name }));

  const travelModeOptions: SelectOption[] = pageLoad?.travelModes.length
    ? pageLoad.travelModes
        .filter(t => mappedTravelModeIds.has(t.travelModeId))
        .map(t => ({ value: String(t.travelModeId), label: t.travelModeName }))
    : travelModes
        .filter(t => mappedTravelModeIds.has(t.id))
        .map(t => ({ value: String(t.id), label: t.name }));

  const methods = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      items: [{ ...DEFAULT_ITEM }],
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'items',
  });

  const handleValidatedSubmit = (values: ExpenseFormValues) => {
    // Sum amounts per expense type across all items in this submission
    const totalsByType: Record<string, number> = {};
    values.items.forEach(item => {
      totalsByType[item.expenseTypeId] = (totalsByType[item.expenseTypeId] ?? 0) + item.amount;
    });

    let hasError = false;
    values.items.forEach((item, index) => {
      // Bill upload required unless an existing bill already covers this item
      if (item.billFiles.length === 0 && !existingBillUrls?.[index]) {
        methods.setError(`items.${index}.billFiles` as never, { type: 'manual', message: 'Please upload a bill' });
        hasError = true;
      }

      const typeOption = expenseTypeOptions.find(o => o.value === item.expenseTypeId);
      const categoryLabel = (typeOption?.label ?? '').toLowerCase();
      const isTravel = categoryLabel === 'travel';

      if (isTravel) {
        if (!item.travelModeId) {
          methods.setError(`items.${index}.travelModeId`, { type: 'manual', message: 'Travel mode is required for travel expenses' });
          hasError = true;
        }
        if (!item.areaFrom?.trim()) {
          methods.setError(`items.${index}.areaFrom`, { type: 'manual', message: 'From location is required for travel expenses' });
          hasError = true;
        }
        if (!item.areaTo?.trim()) {
          methods.setError(`items.${index}.areaTo`, { type: 'manual', message: 'To location is required for travel expenses' });
          hasError = true;
        }
      }

      if (typeOption?.toRange == null) return;

      const submissionTotal = totalsByType[item.expenseTypeId] ?? 0;
      const alreadySpentThisMonth = typeOption.spent ?? 0;
      const combinedTotal = submissionTotal + alreadySpentThisMonth;
      if (combinedTotal > typeOption.toRange) {
        const isMultiple = values.items.filter(i => i.expenseTypeId === item.expenseTypeId).length > 1;
        const msg = alreadySpentThisMonth > 0
          ? `"${typeOption.label}" already has ₹${alreadySpentThisMonth.toLocaleString('en-IN')} used this month; this claim would exceed the monthly limit of ₹${typeOption.toRange.toLocaleString('en-IN')}`
          : isMultiple
            ? `Combined total for "${typeOption.label}" (₹${combinedTotal.toLocaleString('en-IN')}) exceeds the limit of ₹${typeOption.toRange.toLocaleString('en-IN')}`
            : `Amount exceeds the limit of ₹${typeOption.toRange.toLocaleString('en-IN')} for "${typeOption.label}"`;
        methods.setError(`items.${index}.amount`, { type: 'manual', message: msg });
        hasError = true;
      }
    });

    if (!hasError) onSubmit(values);
  };

  return (
    <FormProvider {...methods}>
      <Box component="form" onSubmit={methods.handleSubmit(handleValidatedSubmit)} noValidate>

        {/* Expense Items */}
        {fields.map((field, index) => (
          <ExpenseItemCard
            key={field.id}
            index={index}
            expenseTypeOptions={expenseTypeOptions}
            payModeOptions={payModeOptions}
            travelModeOptions={travelModeOptions}
            employees={employees}
            loadingTypes={loadingTypes}
            loadingPay={loadingPay}
            loadingTravel={loadingTravel}
            loadingDesignationExpenseMaps={loadingDesignationExpenseMaps}
            existingBillUrl={existingBillUrls?.[index]}
            onRemove={() => remove(index)}
            showRemove={fields.length > 1}
          />
        ))}

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => append({ ...DEFAULT_ITEM })}
          sx={{ mb: 3 }}
        >
          Add Another Expense
        </Button>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
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
