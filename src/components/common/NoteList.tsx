// src/components/common/NoteList.tsx
//
// Generic drop-in notes widget, parameterized by (entityType, entityUuid) —
// same pattern as AttachmentList.tsx / CommunicationHistory.tsx. Backend is
// fully generic (app/models/note_model.py), so no per-entity frontend code
// is needed beyond dropping this component in.
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InboxIcon from "@mui/icons-material/Inbox";
import { useTranslation } from "react-i18next";

import { listNotes, createNote, updateNote, deleteNote, type Note } from "../../services/note.service";
import ConfirmDialog from "./ConfirmDialog";
import { useSnackbar } from "../ui/SnackbarProvider";
import { getErrorMessage } from "../../utils/errorMessage";
import { useLocalizationProfile } from "../../hooks/useLocalizationProfile";
import { createFormatters } from "../../utils/formatters/localization";

interface Props {
  entityType: string;
  entityUuid: string;
  canEdit?: boolean;
}

export default function NoteList({ entityType, entityUuid, canEdit = true }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const localizationProfile = useLocalizationProfile();
  const { formatDateTime } = createFormatters(localizationProfile);

  const [rows, setRows] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newText, setNewText] = useState("");
  const [newPinned, setNewPinned] = useState(false);

  const [editUuid, setEditUuid] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editPinned, setEditPinned] = useState(false);

  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);

  const fetchData = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const data = await listNotes(entityType, entityUuid, signal);
      setRows(data);
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

  async function handleAdd() {
    if (!newText.trim()) return;
    setSaving(true);
    try {
      await createNote(entityType, entityUuid, newText, newPinned);
      setNewText("");
      setNewPinned(false);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      fetchData();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.createFailed")), severity: "error" });
    } finally {
      setSaving(false);
    }
  }

  function startEdit(note: Note) {
    setEditUuid(note.uuid);
    setEditText(note.note_text);
    setEditPinned(note.is_pinned);
  }

  async function handleSaveEdit(note: Note) {
    setSaving(true);
    try {
      await updateNote(note.uuid, entityType, editText, editPinned, note.version_no);
      setEditUuid(null);
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      fetchData();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleTogglePin(note: Note) {
    try {
      await updateNote(note.uuid, entityType, note.note_text, !note.is_pinned, note.version_no);
      fetchData();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteUuid) return;
    try {
      await deleteNote(deleteUuid, entityType);
      showSnackbar({ message: t("common.deletedSuccess"), severity: "success" });
      fetchData();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.deleteFailed")), severity: "error" });
    } finally {
      setDeleteUuid(null);
    }
  }

  return (
    <Box>
      {canEdit && (
        <Stack spacing={1} sx={{ mb: 2 }}>
          <TextField
            fullWidth multiline minRows={2} size="small"
            placeholder={t("common.notePlaceholder")}
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <FormControlLabel
              control={<Checkbox size="small" checked={newPinned} onChange={(e) => setNewPinned(e.target.checked)} />}
              label={t("common.pinNote")}
            />
            <Button
              variant="contained" size="small" disabled={saving || !newText.trim()}
              onClick={handleAdd}
            >
              {t("common.addNote")}
            </Button>
          </Stack>
        </Stack>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={20} />
        </Box>
      ) : rows.length === 0 ? (
        <Box textAlign="center" py={3}>
          <InboxIcon sx={{ fontSize: 36, opacity: 0.4 }} />
          <Typography variant="body2" color="text.secondary">{t("common.noRecordsFound")}</Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {rows.map((note) => (
            <Paper key={note.uuid} variant="outlined" sx={{ p: 1.5, bgcolor: note.is_pinned ? "action.hover" : undefined }}>
              {editUuid === note.uuid ? (
                <Stack spacing={1}>
                  <TextField
                    fullWidth multiline minRows={2} size="small"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <FormControlLabel
                      control={<Checkbox size="small" checked={editPinned} onChange={(e) => setEditPinned(e.target.checked)} />}
                      label={t("common.pinNote")}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => setEditUuid(null)}>{t("common.cancel")}</Button>
                      <Button size="small" variant="contained" disabled={saving} onClick={() => handleSaveEdit(note)}>
                        {t("common.save")}
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              ) : (
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                  <Box flex={1}>
                    <Typography variant="body2" whiteSpace="pre-wrap">{note.note_text}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {note.created_by_name || "-"} &bull; {formatDateTime(note.created_at)}
                    </Typography>
                  </Box>
                  {canEdit && (
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => handleTogglePin(note)} title={t("common.pinNote")}>
                        {note.is_pinned ? <PushPinIcon fontSize="small" color="primary" /> : <PushPinOutlinedIcon fontSize="small" />}
                      </IconButton>
                      <IconButton size="small" onClick={() => startEdit(note)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteUuid(note.uuid)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  )}
                </Stack>
              )}
            </Paper>
          ))}
        </Stack>
      )}

      <ConfirmDialog
        open={Boolean(deleteUuid)}
        title={t("common.delete")}
        message={t("common.deleteConfirmMessageShort")}
        confirmText={t("common.delete")}
        onClose={() => setDeleteUuid(null)}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
