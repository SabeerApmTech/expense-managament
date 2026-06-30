import { Controller, useFormContext } from 'react-hook-form';
import { FormControl, Select, MenuItem, FormHelperText, Typography, Box } from '@mui/material';
import type { SelectOption } from '../../types/common.types';

interface Props {
  name: string;
  label: string;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
}

export const FormSelect = ({ name, label, options, required, disabled }: Props) => {
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
          <FormControl fullWidth size="small" error={!!fieldState.error} disabled={disabled}>
            <Select {...field} value={field.value ?? ''} displayEmpty>
              <MenuItem value="">
                <Box component="span" sx={{ color: required ? 'text.disabled' : 'text.secondary', fontStyle: required ? 'normal' : 'italic' }}>
                  {required ? `Select ${label}` : '— None —'}
                </Box>
              </MenuItem>
              {options.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
            {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
          </FormControl>
        </Box>
      )}
    />
  );
};
