import { Controller, useFormContext } from 'react-hook-form';
import { FormControl, Select, MenuItem, ListSubheader, FormHelperText, Typography, Box } from '@mui/material';
import type { SelectOption } from '../../types/common.types';

interface Props {
  name: string;
  label: string;
  options: (SelectOption & { disabled?: boolean; disabledReason?: string; group?: string })[];
  required?: boolean;
  disabled?: boolean;
}

export const FormSelect = ({ name, label, options, required, disabled }: Props) => {
  const { control } = useFormContext();

  // When any option carries a `group`, render a ListSubheader before each contiguous
  // run of that group — callers are expected to have already sorted options by group.
  const hasGroups = options.some((o) => o.group);
  const items: React.ReactNode[] = [];
  let lastGroup: string | undefined;
  options.forEach((opt) => {
    if (hasGroups && opt.group !== lastGroup) {
      lastGroup = opt.group;
      items.push(<ListSubheader key={`group-${opt.group}`}>{opt.group}</ListSubheader>);
    }
    items.push(
      <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>
        {opt.label}{opt.disabledReason ? ` (${opt.disabledReason})` : ''}
      </MenuItem>
    );
  });

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
              {items}
            </Select>
            {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
          </FormControl>
        </Box>
      )}
    />
  );
};
