import { Controller, useFormContext } from 'react-hook-form';
import { TextField, Typography, Box } from '@mui/material';

interface Props {
  name: string;
  label: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const FormTextField = ({
  name, label, type = 'text', multiline, rows, required, disabled, placeholder,
}: Props) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5, color: 'text.primary' }}>
            {label}
            {required && <Box component="span" sx={{ color: 'error.main', ml: 0.25 }}>*</Box>}
          </Typography>
          <TextField
            {...field}
            type={type}
            multiline={multiline}
            rows={rows}
            disabled={disabled}
            placeholder={placeholder}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            fullWidth
            size="small"
            hiddenLabel
            value={type === 'number' ? (field.value === 0 || field.value == null ? '' : field.value) : (field.value ?? '')}
            onChange={(e) => {
              if (type === 'number') {
                const parsed = parseFloat(e.target.value);
                field.onChange(isNaN(parsed) ? 0 : parsed);
              } else {
                field.onChange(e.target.value);
              }
            }}
          />
        </Box>
      )}
    />
  );
};
