// src/components/common/FilePreviewDialog.tsx
import { Box, Dialog, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { getFileKind } from '../../services/upload.service';

interface FilePreviewDialogProps {
  open: boolean;
  url: string | null;
  label?: string;
  onClose: () => void;
}

export default function FilePreviewDialog({ open, url, label, onClose }: FilePreviewDialogProps) {
  const kind = url ? getFileKind(url) : null;

  return (
    <Dialog open={open && !!url} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{ position: 'relative', bgcolor: 'background.default' }}>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            bgcolor: 'background.paper',
            boxShadow: 1,
            '&:hover': { bgcolor: 'background.paper' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {url && kind === 'image' && (
          <Box
            component="img"
            src={url}
            alt={label ?? 'Preview'}
            sx={{ display: 'block', width: '100%', maxHeight: '85vh', objectFit: 'contain' }}
          />
        )}

        {url && kind === 'pdf' && (
          <Box
            component="iframe"
            src={url}
            title={label ?? 'Preview'}
            sx={{ display: 'block', width: '100%', height: '85vh', border: 'none' }}
          />
        )}

        {url && kind === 'other' && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <InsertDriveFileIcon sx={{ fontSize: 64, opacity: 0.5, mb: 2 }} />
            <Box>
              <a href={url} target="_blank" rel="noopener noreferrer">
                Open file in new tab
              </a>
            </Box>
          </Box>
        )}
      </Box>
    </Dialog>
  );
}
