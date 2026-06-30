import {
  Grid, Button, Box, CircularProgress, Typography, TextField,
  Paper, IconButton, Divider, Autocomplete,
} from '@mui/material';
import { FormProvider, useForm, useFieldArray, Controller, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { FormSelect } from '../../../components/forms/FormSelect';
import { FormDatePicker } from '../../../components/forms/FormDatePicker';
import { FormTextField } from '../../../components/forms/FormTextField';
import { useExpenseTypes, usePayModes, useTravelModes, useExpensePageLoad } from '../hooks/useMasterData';
import { useDesignationExpenseMaps, useDesignationTravelMaps, useEmployees } from '../../admin/hooks/useAdminMaster';
import { getStoredAuth } from '../../../store/authStore';
import { expenseSchema, type ExpenseFormValues } from '../schemas/expense.schema';
import type { SelectOption } from '../../../types/common.types';

interface Props {
  defaultValues?: Partial<ExpenseFormValues>;
  existingBillUrls?: (string | null | undefined)[];
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

// ─── Main form ────────────────────────────────────────────────────────────────

export const ExpenseForm = ({ defaultValues, existingBillUrls, onSubmit, isSubmitting, onCancel }: Props) => {
  const { data: pageLoad } = useExpensePageLoad();
  const { data: expenseTypes = [], isLoading: loadingTypes } = useExpenseTypes();
  const { data: payModes = [], isLoading: loadingPay } = usePayModes();
  const { data: travelModes = [], isLoading: loadingTravel } = useTravelModes();
  const { data: designationExpenseMaps = [], isLoading: loadingDesignationExpenseMaps } = useDesignationExpenseMaps();
  const { data: designationTravelMaps = [] } = useDesignationTravelMaps();
  const { data: allEmployees = [] } = useEmployees();

  const currentUserId = getStoredAuth()?.id;
  const employees = allEmployees.filter(e => e.id !== currentUserId);

  const userDesignationId = pageLoad?.designationId;

  const userExpenseMaps = designationExpenseMaps.filter(m => m.designationId === userDesignationId);
  const mappedExpenseTypeIds = new Set(userExpenseMaps.map(m => m.expenseTypeId));

  const expenseTypeOptions: (SelectOption & { fromRange?: number; toRange?: number })[] = pageLoad?.expenseTypes.length
    ? pageLoad.expenseTypes
      .filter(t => mappedExpenseTypeIds.has(t.expenseTypeId))
      .map(t => {
        const map = userExpenseMaps.find(m => m.expenseTypeId === t.expenseTypeId);
        return { value: String(t.expenseTypeId), label: t.expenseTypeName, fromRange: map?.amountRangeFrom, toRange: map?.amountRangeTo };
      })
    : expenseTypes
      .filter(t => mappedExpenseTypeIds.has(t.id))
      .map(t => {
        const map = userExpenseMaps.find(m => m.expenseTypeId === t.id);
        return { value: String(t.id), label: t.name, fromRange: map?.amountRangeFrom, toRange: map?.amountRangeTo };
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
      if (typeOption?.toRange == null) return;

      const combinedTotal = totalsByType[item.expenseTypeId] ?? 0;
      if (combinedTotal > typeOption.toRange) {
        const isMultiple = values.items.filter(i => i.expenseTypeId === item.expenseTypeId).length > 1;
        const msg = isMultiple
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
          <Paper
            key={field.id}
            variant="outlined"
            sx={{ p: 2.5, mb: 2, borderRadius: 2, position: 'relative' }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Expense Item {fields.length > 1 ? `#${index + 1}` : ''}
              </Typography>
              {fields.length > 1 && (
                <IconButton size="small" color="error" onClick={() => remove(index)}>
                  <DeleteForeverIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name={`items.${index}.initiatedBy`}
                  control={methods.control}
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
                          <TextField
                            {...params}
                            size="small"
                            hiddenLabel
                            placeholder="Select Employee"
                            error={!!fieldState.error}
                            helperText={fieldState.error?.message}
                          />
                        )}
                      />
                    </Box>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect
                  name={`items.${index}.expenseTypeId`}
                  label="Category"
                  options={expenseTypeOptions}
                  disabled={loadingTypes || loadingDesignationExpenseMaps}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <AmountField index={index} expenseTypeOptions={expenseTypeOptions} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormDatePicker name={`items.${index}.fromDate`} label="From Date" required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormDatePicker
                  name={`items.${index}.toDate`}
                  label="To Date"
                  required
                  minDate={methods.watch(`items.${index}.fromDate`) || undefined}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name={`items.${index}.payModeId`} label="Pay Mode" options={payModeOptions} disabled={loadingPay} required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormSelect name={`items.${index}.travelModeId`} label="Travel Mode" options={travelModeOptions} disabled={loadingTravel} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name={`items.${index}.areaFrom`} label="From Location" required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormTextField name={`items.${index}.areaTo`} label="To Location" required />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormTextField name={`items.${index}.description`} label="Description" multiline rows={2} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ mb: 1 }} />
                <ItemFileUpload index={index} existingBillUrl={existingBillUrls?.[index]} />
              </Grid>
            </Grid>
          </Paper>
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
