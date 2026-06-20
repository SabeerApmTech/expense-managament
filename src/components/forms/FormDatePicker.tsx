import { Controller, useFormContext } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Typography, Box } from '@mui/material';
import dayjs from 'dayjs';

interface Props {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

export const FormDatePicker = ({ name, label, required, disabled, minDate, maxDate }: Props) => {
  const { control } = useFormContext();
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, color: 'text.primary' }}>
              {label}
              {required && <Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>*</Box>}
            </Typography>
            <DatePicker
              value={field.value ? dayjs(field.value) : null}
              onChange={(v) => field.onChange(v ? v.format('YYYY-MM-DD') : '')}
              disabled={disabled}
              minDate={minDate ? dayjs(minDate) : undefined}
              maxDate={maxDate ? dayjs(maxDate) : undefined}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  error: !!fieldState.error,
                  helperText: fieldState.error?.message,
                },
              }}
            />
          </Box>
        )}
      />
    </LocalizationProvider>
  );
};
