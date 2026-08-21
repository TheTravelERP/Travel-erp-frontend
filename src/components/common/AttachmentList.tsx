// src/components/common/AttachmentList.tsx
//
// Generic drop-in attachment widget, parameterized by (entityType, entityUuid,
// menuKey) so it can be attached to any entity's view page — same pattern as
// CommunicationHistory.tsx. Storage/validation is fully generic on the
// backend (app/models/attachment_model.py delegates file I/O to the existing
// file_upload_service), so no per-entity frontend code is needed beyond
// dropping this component in.
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import InboxIcon from '@mui/icons-material/Inbox';
import { useTranslation } from 'react-i18next';

import {
  listAttachments,
  uploadAttachment,
  deleteAttachment,
  type Attachment,
} from '../../services/attachment.service';
import { resolveUploadUrl, getFileKind } from '../../services/upload.service';
import ConfirmDialog from './ConfirmDialog';
import { useSnackbar } from '../ui/SnackbarProvider';
import { getErrorMessage } from '../../utils/errorMessage';

interface Props {
  entityType: string;
  entityUuid: string;
  menuKey: string;
  category?: string;
  canEdit?: boolean;
  onCountChange?: (count: number) => void;
}

export default function AttachmentList({ entityType, entityUuid, menuKey, category = 'attachment', canEdit = true, onCountChange }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const [rows, setRows] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);

  const fetchData = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await listAttachments(entityType, entityUuid, menuKey, signal);
      setRows(data);
      if (!signal?.aborted) onCountChange?.(data.length);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityUuid]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      await uploadAttachment(entityType, entityUuid, menuKey, category, file);
      showSnackbar({ message: t('common.createdSuccess'), severity: 'success' });
      fetchData();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t('common.createFailed')), severity: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUuid) return;
    try {
      await deleteAttachment(deleteUuid, menuKey);
      showSnackbar({ message: t('common.deletedSuccess'), severity: 'success' });
      fetchData();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t('common.deleteFailed')), severity: 'error' });
    } finally {
      setDeleteUuid(null);
    }
  };

  return (
    <Box>
      {canEdit && (
        <Button
          variant="outlined"
          size="small"
          component="label"
          startIcon={uploading ? <CircularProgress size={16} /> : <UploadIcon />}
          disabled={uploading}
          sx={{ mb: 1.5 }}
        >
          {uploading ? t('common.saving') : t('common.upload')}
          <input
            type="file"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = '';
            }}
          />
        </Button>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={20} />
        </Box>
      ) : rows.length === 0 ? (
        <Box textAlign="center" py={3}>
          <InboxIcon sx={{ fontSize: 36, opacity: 0.4 }} />
          <Typography variant="body2" color="text.secondary">{t('common.noRecordsFound')}</Typography>
        </Box>
      ) : (
        <List dense>
          {rows.map((row) => {
            const url = resolveUploadUrl(row.file_url);
            const kind = url ? getFileKind(url) : 'other';
            return (
              <ListItem
                key={row.uuid}
                secondaryAction={
                  canEdit && (
                    <IconButton size="small" color="error" onClick={() => setDeleteUuid(row.uuid)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )
                }
                component="a"
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textDecoration: 'none' }}
              >
                <ListItemIcon>
                  {kind === 'pdf' ? <PictureAsPdfIcon /> : <InsertDriveFileIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={row.original_filename || row.category || t('common.file')}
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      {row.category && <Chip size="small" label={row.category} />}
                      <Typography variant="caption" color="text.secondary">
                        {new Date(row.created_at).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}

      <ConfirmDialog
        open={Boolean(deleteUuid)}
        title={t('common.delete')}
        message={t('common.deleteConfirmMessageShort')}
        confirmText={t('common.delete')}
        onClose={() => setDeleteUuid(null)}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
