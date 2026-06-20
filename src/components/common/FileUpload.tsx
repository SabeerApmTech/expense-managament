import { Box, Button, Typography, IconButton } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRef } from 'react';

interface Props {
  value?: File | null;
  onChange: (file: File | null) => void;
  existingFileUrl?: string | null;
  accept?: string;
  label?: string;
  error?: string;
}

export const FileUpload = ({
  value,
  onChange,
  existingFileUrl,
  accept = 'image/*,application/pdf',
  label = 'Upload Attachment',
  error,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const existingFileName = existingFileUrl
    ? decodeURIComponent(existingFileUrl.split('/').pop() ?? 'Uploaded file')
    : null;

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />

      {value ? (
        /* New file selected */
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, border: 1, borderColor: 'primary.main', borderRadius: 1 }}>
          <AttachFileIcon fontSize="small" color="primary" />
          <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value.name}
          </Typography>
          <IconButton size="small" onClick={() => onChange(null)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : existingFileUrl ? (
        /* Existing file from server — show link + replace option */
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <AttachFileIcon fontSize="small" color="success" />
          <Typography
            component="a"
            href={existingFileUrl}
            target="_blank"
            rel="noreferrer"
            variant="body2"
            sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            {existingFileName}
          </Typography>
          <Button size="small" variant="text" onClick={() => inputRef.current?.click()} sx={{ flexShrink: 0 }}>
            Replace
          </Button>
        </Box>
      ) : (
        /* No file at all */
        <Button
          variant="outlined"
          startIcon={<AttachFileIcon />}
          onClick={() => inputRef.current?.click()}
          color={error ? 'error' : 'primary'}
          fullWidth
        >
          {label}
        </Button>
      )}

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};
