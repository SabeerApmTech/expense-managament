import { Box, Typography } from '@mui/material';

interface FieldLabelProps {
  children: React.ReactNode;
}

export const FieldLabel = ({ children }: FieldLabelProps) => (
  <Typography
    variant="caption"
    color="text.secondary"
    sx={{ fontWeight: 600, letterSpacing: 0.5, display: 'block', textTransform: 'uppercase', mb: 0.25 }}
  >
    {children}
  </Typography>
);

interface FieldProps {
  label: string;
  value: React.ReactNode;
  compact?: boolean;
}

export const Field = ({ label, value, compact = false }: FieldProps) => (
  <Box>
    <FieldLabel>{label}</FieldLabel>
    <Typography
      variant={compact ? 'body2' : 'body1'}
      sx={{ mt: 0.25, ...(compact && { fontWeight: 500 }) }}
    >
      {value || '-'}
    </Typography>
  </Box>
);
