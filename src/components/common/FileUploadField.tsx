// src/components/common/FileUploadField.tsx
import { useRef, useState } from 'react';
import { Avatar, Box, Button, Chip, CircularProgress, Stack, Typography } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloseIcon from '@mui/icons-material/Close';

interface FileUploadFieldProps {
  label: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  onUpload: (file: File) => Promise<string>;
  accept?: string;
  variant?: 'avatar' | 'document';
  helperText?: string;
}

export default function FileUploadField({
  label,
  value,
  onChange,
  onUpload,
  accept = 'image/jpeg,image/png,image/webp',
  variant = 'document',
  helperText,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="body2" fontWeight={600} mb={0.5}>
        {label}
      </Typography>

      <Stack direction="row" alignItems="center" spacing={1.5}>
        {variant === 'avatar' ? (
          <Avatar src={value ?? undefined} sx={{ width: 56, height: 56 }} />
        ) : value ? (
          <Chip
            icon={<InsertDriveFileIcon />}
            label="File uploaded"
            onDelete={() => onChange(null)}
            deleteIcon={<CloseIcon />}
          />
        ) : null}

        <Button
          variant="outlined"
          size="small"
          component="label"
          startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : value ? 'Replace' : 'Upload'}
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
              e.target.value = '';
            }}
          />
        </Button>

        {variant === 'avatar' && value && (
          <Button size="small" color="error" onClick={() => onChange(null)}>
            Remove
          </Button>
        )}
      </Stack>

      {helperText && !error && (
        <Typography variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      )}
      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}
    </Box>
  );
}
