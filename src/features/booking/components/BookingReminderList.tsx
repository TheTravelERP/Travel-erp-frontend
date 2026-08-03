// src/features/booking/components/BookingReminderList.tsx
import { useEffect, useState } from "react";
import {
  Box, Button, Chip, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";

import type { BookingReminderDetail, BookingReminderFormInput } from "../bookingReminder.types";
import { createBookingReminder, getBookingReminders } from "../bookingReminder.api";
import BookingReminderFormDialog from "./BookingReminderFormDialog";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../utils/errorMessage";
import { useLocalizationProfile } from "../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../utils/formatters/localization";

interface Props {
  bookingUuid: string;
  canEdit: boolean;
}

export default function BookingReminderList({ bookingUuid, canEdit }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const localizationProfile = useLocalizationProfile();
  const { formatDateTime } = createFormatters(localizationProfile);

  const [rows, setRows] = useState<BookingReminderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await getBookingReminders(bookingUuid));
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
      await createBookingReminder(bookingUuid, data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      setDialogOpen(false);
      load();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.createFailed")), severity: "error" });
    }
  }

  return (
    <Box>
      {canEdit && (
        <Stack direction="row" spacing={1.5} mb={2}>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
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
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <BookingReminderFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSubmit={handleSubmit} />
    </Box>
  );
}
