// src/features/booking/components/BookingReminderList.tsx
import { useEffect, useState } from "react";
import {
  Box, Button, Chip, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";

import type { BookingReminderDetail, BookingReminderFormInput } from "../bookingReminder.types";
import {
  createBookingReminder, deleteBookingReminder, getBookingReminders, updateBookingReminder,
} from "../bookingReminder.api";
import BookingReminderFormDialog from "./BookingReminderFormDialog";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../utils/errorMessage";
import { useLocalizationProfile } from "../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../utils/formatters/localization";

interface Props {
  bookingUuid: string;
  canEdit: boolean;
  onCountChange?: (count: number) => void;
}

export default function BookingReminderList({ bookingUuid, canEdit, onCountChange }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const localizationProfile = useLocalizationProfile();
  const { formatDateTime } = createFormatters(localizationProfile);

  const [rows, setRows] = useState<BookingReminderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BookingReminderDetail | null>(null);
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getBookingReminders(bookingUuid);
      setRows(data);
      onCountChange?.(data.length);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingUuid]);

  async function handleSubmit(data: BookingReminderFormInput) {
    try {
      if (editing) {
        await updateBookingReminder(bookingUuid, editing.uuid, { ...data, version_no: editing.version_no });
        showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      } else {
        await createBookingReminder(bookingUuid, data);
        showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      }
      setDialogOpen(false);
      setEditing(null);
      load();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, editing ? t("common.updateFailed") : t("common.createFailed")), severity: "error" });
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteUuid) return;
    setBusy(true);
    try {
      await deleteBookingReminder(bookingUuid, deleteUuid);
      showSnackbar({ message: t("common.deletedSuccess"), severity: "success" });
      load();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.deleteFailed")), severity: "error" });
    } finally {
      setBusy(false);
      setDeleteUuid(null);
    }
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(row: BookingReminderDetail) {
    setEditing(row);
    setDialogOpen(true);
  }

  return (
    <Box>
      {canEdit && (
        <Stack direction="row" spacing={1.5} mb={2}>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            {t("booking.addReminder")}
          </Button>
        </Stack>
      )}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("booking.reminderType")}</TableCell>
              <TableCell>{t("booking.notes")}</TableCell>
              <TableCell>{t("booking.nextReminderDatetime")}</TableCell>
              <TableCell>{t("booking.assignedTo")}</TableCell>
              <TableCell>{t("common.status")}</TableCell>
              {canEdit && <TableCell align="right">{t("common.actions")}</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    {t("common.noRecordsFound")}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={row.uuid}>
                <TableCell>{row.followup_type}</TableCell>
                <TableCell>{row.discussion_notes}</TableCell>
                <TableCell>{row.next_followup_datetime ? formatDateTime(row.next_followup_datetime) : "-"}</TableCell>
                <TableCell>{row.assigned_user_name || "-"}</TableCell>
                <TableCell><Chip size="small" label={row.status} /></TableCell>
                {canEdit && (
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(row)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteUuid(row.uuid)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <BookingReminderFormDialog
        open={dialogOpen}
        reminder={editing}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteUuid)} title={t("common.delete")} message={t("common.deleteConfirmMessageShort")}
        confirmText={t("common.delete")} loading={busy}
        onClose={() => setDeleteUuid(null)} onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
}
