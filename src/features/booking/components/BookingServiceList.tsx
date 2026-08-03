// src/features/booking/components/BookingServiceList.tsx
import { useEffect, useState } from "react";
import {
  Box, Button, Chip, IconButton, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";

import type { BookingServiceLineDetail, BookingServiceLineFormInput } from "../bookingService.types";
import {
  createBookingServiceLine, deleteBookingServiceLine, getBookingServiceLines, updateBookingServiceLine,
} from "../bookingService.api";
import BookingServiceFormDialog from "./BookingServiceFormDialog";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../utils/errorMessage";

interface Props {
  bookingUuid: string;
  canEdit: boolean;
  onChanged?: () => void;
}

const STATUS_COLOR: Record<string, "default" | "primary" | "success" | "error" | "warning"> = {
  Pending: "default", Confirmed: "success", Completed: "primary", Cancelled: "error",
};

export default function BookingServiceList({ bookingUuid, canEdit, onChanged }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const [rows, setRows] = useState<BookingServiceLineDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BookingServiceLineDetail | null>(null);
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setRows(await getBookingServiceLines(bookingUuid));
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

  async function handleSubmit(data: BookingServiceLineFormInput) {
    try {
      if (editing) {
        await updateBookingServiceLine(bookingUuid, editing.uuid, { ...data, version_no: editing.version_no });
        showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      } else {
        await createBookingServiceLine(bookingUuid, data);
        showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      }
      setDialogOpen(false);
      setEditing(null);
      load();
      onChanged?.();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteUuid) return;
    setBusy(true);
    try {
      await deleteBookingServiceLine(bookingUuid, deleteUuid);
      showSnackbar({ message: t("common.deletedSuccess"), severity: "success" });
      load();
      onChanged?.();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.deleteFailed")), severity: "error" });
    } finally {
      setBusy(false);
      setDeleteUuid(null);
    }
  }

  return (
    <Box>
      {canEdit && (
        <Stack direction="row" spacing={1.5} mb={2}>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setDialogOpen(true); }}>
            {t("booking.addService")}
          </Button>
        </Stack>
      )}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("quotation.serviceType")}</TableCell>
              <TableCell>{t("quotation.description")}</TableCell>
              <TableCell>{t("booking.supplier")}</TableCell>
              <TableCell align="right">{t("quotation.sellingPrice")}</TableCell>
              <TableCell align="right">{t("quotation.netAmount")}</TableCell>
              <TableCell>{t("common.status")}</TableCell>
              {canEdit && <TableCell align="right">{t("common.actions")}</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    {t("common.noRecordsFound")}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {rows.map((row) => (
              <TableRow key={row.uuid}>
                <TableCell>{row.service_type}</TableCell>
                <TableCell>{row.description || "-"}</TableCell>
                <TableCell>{row.vendor_name || "-"}</TableCell>
                <TableCell align="right">{row.selling_price.toFixed(2)}</TableCell>
                <TableCell align="right">{row.net_amount.toFixed(2)}</TableCell>
                <TableCell><Chip size="small" color={STATUS_COLOR[row.status] ?? "default"} label={row.status} /></TableCell>
                {canEdit && (
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => { setEditing(row); setDialogOpen(true); }}>
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

      <BookingServiceFormDialog
        open={dialogOpen}
        line={editing}
        canEdit={canEdit}
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
