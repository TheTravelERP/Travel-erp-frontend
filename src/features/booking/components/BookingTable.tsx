// src/features/booking/components/BookingTable.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  useTheme,
  useMediaQuery,
  CardContent,
  Typography,
  TablePagination,
  Divider,
  Stack,
  Skeleton,
  Paper,
  IconButton,
  Button,
  Chip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import InboxIcon from "@mui/icons-material/Inbox";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";

import type { BookingListItem } from "../booking.types";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import SortableTableCell from "../../../components/common/SortableTableCell";
import { useLocalizationProfile } from "../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../utils/formatters/localization";
import {
  bulkDeleteBookings, bulkRestoreBookings, deleteBookingByUuid, restoreBookingByUuid,
} from "../booking.api";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../utils/errorMessage";

interface Props {
  rows: BookingListItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  isTrash: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (columnId: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRefresh: () => void;
}

const STATUS_COLOR: Record<string, "default" | "primary" | "success" | "error" | "warning"> = {
  Draft: "default",
  Confirmed: "success",
  "Partially Confirmed": "warning",
  "Travel Started": "primary",
  Completed: "success",
  Cancelled: "error",
  Closed: "default",
};

// Mirrors LOCKED_STATUSES in app/services/booking_service.py — everything
// else (including Cancelled) can still be soft-deleted from the list.
const DELETE_LOCKED_STATUSES = ["Confirmed", "Partially Confirmed", "Travel Started", "Completed"];

function getColumns(t: TFunction) {
  return [
    { id: "booking_no", label: t("booking.bookingNo"), sortable: true, minWidth: 130 },
    { id: "customer_name", label: t("common.customer"), minWidth: 150 },
    { id: "enquiry_no", label: t("booking.enquiry"), minWidth: 110 },
    { id: "status", label: t("common.status"), sortable: true, minWidth: 130 },
    { id: "booking_date", label: t("booking.bookingDate"), sortable: true, minWidth: 110 },
    { id: "net_amount", label: t("booking.netAmount"), sortable: true, minWidth: 110, align: "right" as const },
  ];
}

export default function BookingTable({
  rows, loading, page, pageSize, total, isTrash, sortBy, sortOrder, onSortChange, onPageChange, onPageSizeChange, onRefresh,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { t } = useTranslation();
  const columns = useMemo(() => getColumns(t), [t]);
  const localizationProfile = useLocalizationProfile();
  const { formatDate } = useMemo(() => createFormatters(localizationProfile), [localizationProfile]);
  const { showSnackbar } = useSnackbar();

  const [actionUuid, setActionUuid] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    setSelected(new Set());
  }, [rows, isTrash]);

  function toggleRow(uuid: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => (prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.uuid))));
  }

  async function handleBulkConfirm() {
    const uuids = Array.from(selected);
    if (!uuids.length) return;

    try {
      setBulkLoading(true);
      const result = isTrash ? await bulkRestoreBookings(uuids) : await bulkDeleteBookings(uuids);

      if (!isTrash && result.count === 0) {
        showSnackbar({ message: t("booking.bulkDeleteNoneEligible"), severity: "warning" });
      } else if (!isTrash && result.count < uuids.length) {
        showSnackbar({
          message: t("booking.bulkDeletePartial", { count: result.count, total: uuids.length }),
          severity: "warning",
        });
      } else {
        showSnackbar({ message: result.message, severity: "success" });
      }
      setSelected(new Set());
      onRefresh();
    } catch (err: any) {
      showSnackbar({
        message: getErrorMessage(err, isTrash ? t("common.restoreSelectedFailed") : t("common.deleteSelectedFailed")),
        severity: "error",
      });
    } finally {
      setBulkLoading(false);
      setBulkConfirmOpen(false);
    }
  }

  const selectionBar = selected.size > 0 && (
    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, mb: 1, borderRadius: 1, bgcolor: "action.selected" }}>
      <Typography variant="body2" fontWeight={600}>{t("common.selectedCount", { count: selected.size })}</Typography>
      <Stack direction="row" spacing={1}>
        <Button size="small" onClick={() => setSelected(new Set())}>{t("common.clear")}</Button>
        <Button
          size="small" variant="contained" color={isTrash ? "success" : "error"}
          startIcon={isTrash ? <RestoreFromTrashIcon fontSize="small" /> : <DeleteIcon fontSize="small" />}
          onClick={() => setBulkConfirmOpen(true)}
        >
          {isTrash ? t("common.restoreSelected") : t("common.deleteSelected")}
        </Button>
      </Stack>
    </Box>
  );

  async function handleConfirmAction() {
    if (!actionUuid) return;
    try {
      setActionLoading(true);
      if (isTrash) {
        await restoreBookingByUuid(actionUuid);
        showSnackbar({ message: t("common.restoredSuccess"), severity: "success" });
      } else {
        await deleteBookingByUuid(actionUuid);
        showSnackbar({ message: t("common.deletedSuccess"), severity: "success" });
      }
      onRefresh();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, isTrash ? t("common.restoreFailed") : t("common.deleteFailed")), severity: "error" });
    } finally {
      setActionLoading(false);
      setActionUuid(null);
    }
  }

  function renderActions(row: BookingListItem) {
    if (isTrash) {
      return (
        <IconButton size="small" color="success" onClick={() => setActionUuid(row.uuid)}>
          <RestoreFromTrashIcon fontSize="small" />
        </IconButton>
      );
    }
    return (
      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
        <IconButton size="small" onClick={() => navigate(`/app/bookings/list/${row.uuid}`)}>
          <VisibilityIcon fontSize="small" />
        </IconButton>
        {!DELETE_LOCKED_STATUSES.includes(row.status) && (
          <IconButton size="small" color="error" onClick={() => setActionUuid(row.uuid)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Stack>
    );
  }

  if (isMobile) {
    return (
      <Box>
        {selectionBar}

        {loading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} height={110} sx={{ mb: 2 }} />)
        ) : rows.length ? (
          rows.map((row) => (
            <Paper key={row.uuid} sx={{ mb: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Checkbox size="small" checked={selected.has(row.uuid)} onChange={() => toggleRow(row.uuid)} />
                    <Typography fontWeight={600} sx={{ cursor: "pointer" }} onClick={() => navigate(`/app/bookings/list/${row.uuid}`)}>
                      {row.booking_no}
                    </Typography>
                  </Stack>
                  <Chip size="small" color={STATUS_COLOR[row.status] ?? "default"} label={row.status} />
                </Stack>
                <Typography variant="caption">{row.customer_name} &bull; {row.enquiry_no}</Typography>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">{formatDate(row.booking_date)}</Typography>
                  <Typography variant="body2" fontWeight={600}>{row.currency_code} {row.net_amount.toFixed(2)}</Typography>
                </Stack>

                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="flex-end">{renderActions(row)}</Stack>
              </CardContent>
            </Paper>
          ))
        ) : (
          <Box textAlign="center" py={5}>
            <InboxIcon sx={{ fontSize: 48, opacity: 0.4 }} />
            <Typography>{t("common.noRecordsFound")}</Typography>
          </Box>
        )}

        <TablePagination
          component="div" count={total} page={page - 1} rowsPerPage={pageSize}
          onPageChange={(_, p) => onPageChange(p + 1)}
          onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        />

        <ConfirmDialog
          open={Boolean(actionUuid)}
          title={isTrash ? t("common.restore") : t("common.delete")}
          message={isTrash ? t("common.restoreConfirmMessage") : t("common.deleteConfirmMessageShort")}
          confirmText={isTrash ? t("common.restore") : t("common.delete")}
          loading={actionLoading}
          onClose={() => setActionUuid(null)}
          onConfirm={handleConfirmAction}
        />
        <ConfirmDialog
          open={bulkConfirmOpen}
          title={isTrash ? t("common.restore") : t("common.delete")}
          message={isTrash ? t("common.restoreBulkConfirmMessage", { count: selected.size }) : t("common.deleteBulkConfirmMessage", { count: selected.size })}
          confirmText={isTrash ? t("common.restore") : t("common.delete")}
          loading={bulkLoading}
          onClose={() => setBulkConfirmOpen(false)}
          onConfirm={handleBulkConfirm}
        />
      </Box>
    );
  }

  return (
    <>
      {selectionBar}

      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selected.size > 0 && selected.size < rows.length}
                  checked={rows.length > 0 && selected.size === rows.length}
                  onChange={toggleSelectAll}
                  disabled={rows.length === 0}
                />
              </TableCell>
              {columns.map((col) => (
                <SortableTableCell
                  key={col.id} id={col.id} label={col.label} sortable={col.sortable}
                  align={col.align} minWidth={col.minWidth}
                  sortBy={sortBy} sortOrder={sortOrder} onSort={onSortChange}
                />
              ))}
              <TableCell align="right">{t("common.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && [...Array(pageSize)].map((_, i) => (
              <TableRow key={i}><TableCell colSpan={8}><Skeleton height={40} /></TableCell></TableRow>
            ))}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box textAlign="center" py={5}>
                    <InboxIcon sx={{ fontSize: 48, opacity: 0.4 }} />
                    <Typography>{t("common.noRecordsFound")}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {!loading && rows.map((row) => (
              <TableRow key={row.uuid} hover selected={selected.has(row.uuid)}>
                <TableCell padding="checkbox">
                  <Checkbox checked={selected.has(row.uuid)} onChange={() => toggleRow(row.uuid)} />
                </TableCell>
                <TableCell sx={{ cursor: "pointer" }} onClick={() => navigate(`/app/bookings/list/${row.uuid}`)}>{row.booking_no}</TableCell>
                <TableCell>{row.customer_name}</TableCell>
                <TableCell>{row.enquiry_no}</TableCell>
                <TableCell><Chip size="small" color={STATUS_COLOR[row.status] ?? "default"} label={row.status} /></TableCell>
                <TableCell>{formatDate(row.booking_date)}</TableCell>
                <TableCell align="right">{row.currency_code} {row.net_amount.toFixed(2)}</TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>{renderActions(row)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div" count={total} page={page - 1} rowsPerPage={pageSize}
        onPageChange={(_, p) => onPageChange(p + 1)}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
      />

      <ConfirmDialog
        open={Boolean(actionUuid)} title={isTrash ? t("common.restore") : t("common.delete")}
        message={isTrash ? t("common.restoreConfirmMessage") : t("common.deleteConfirmMessageShort")}
        confirmText={isTrash ? t("common.restore") : t("common.delete")}
        loading={actionLoading}
        onClose={() => setActionUuid(null)} onConfirm={handleConfirmAction}
      />
      <ConfirmDialog
        open={bulkConfirmOpen} title={isTrash ? t("common.restore") : t("common.delete")}
        message={isTrash ? t("common.restoreBulkConfirmMessage", { count: selected.size }) : t("common.deleteBulkConfirmMessage", { count: selected.size })}
        confirmText={isTrash ? t("common.restore") : t("common.delete")}
        loading={bulkLoading}
        onClose={() => setBulkConfirmOpen(false)} onConfirm={handleBulkConfirm}
      />
    </>
  );
}
