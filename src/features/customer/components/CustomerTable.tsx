// src/features/customer/components/CustomerTable.tsx

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
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InboxIcon from "@mui/icons-material/Inbox";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import type { CustomerListItem } from "../customer.types";
import { formatDate } from "../../../utils/formatters/date";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import SortableTableCell from "../../../components/common/SortableTableCell";
import {
  bulkDeleteCustomers,
  bulkRestoreCustomers,
  deleteCustomerByUuid,
  restoreCustomerByUuid,
} from "../customer.api";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";

/* ================= TYPES ================= */

interface Props {
  rows: CustomerListItem[];
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

interface TableColumn {
  id: keyof CustomerListItem | string;
  label: string;
  sortable?: boolean;
  minWidth?: number;
  align?: "left" | "center" | "right";
}

function getColumns(t: TFunction): TableColumn[] {
  return [
    { id: "name", label: t("common.customerName"), sortable: true, minWidth: 180 },
    { id: "mobile", label: t("common.mobile"), sortable: true, minWidth: 150 },
    { id: "email", label: t("common.email"), sortable: true, minWidth: 200 },
    { id: "nationality", label: t("customer.nationality"), sortable: true, minWidth: 130 },
    { id: "passport_no", label: t("customer.passportNumber"), sortable: true, minWidth: 140 },
    { id: "created_at", label: t("common.createdOn"), sortable: true, minWidth: 130 },
  ];
}

/* ================= COMPONENT ================= */

export default function CustomerTable({
  rows,
  loading,
  page,
  pageSize,
  total,
  isTrash,
  sortBy,
  sortOrder,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onRefresh,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { t } = useTranslation();
  const columns = useMemo(() => getColumns(t), [t]);
  const [actionUuid, setActionUuid] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();
  const [actionLoading, setActionLoading] = useState(false);

  /* ---------- BULK SELECTION ---------- */
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
    setSelected((prev) =>
      prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.uuid)),
    );
  }

  async function handleBulkConfirm() {
    const uuids = Array.from(selected);
    if (!uuids.length) return;

    try {
      setBulkLoading(true);

      const result = isTrash
        ? await bulkRestoreCustomers(uuids)
        : await bulkDeleteCustomers(uuids);

      showSnackbar({ message: result.message, severity: "success" });
      setSelected(new Set());
      onRefresh();
    } catch (err: any) {
      showSnackbar({
        message:
          err?.response?.data?.detail ??
          (isTrash ? t("common.restoreSelectedFailed") : t("common.deleteSelectedFailed")),
        severity: "error",
      });
    } finally {
      setBulkLoading(false);
      setBulkConfirmOpen(false);
    }
  }

  const selectionBar = selected.size > 0 && (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      sx={{ p: 1.5, mb: 1, borderRadius: 1, bgcolor: "action.selected" }}
    >
      <Typography variant="body2" fontWeight={600}>
        {t("common.selectedCount", { count: selected.size })}
      </Typography>

      <Stack direction="row" spacing={1}>
        <Button size="small" onClick={() => setSelected(new Set())}>
          {t("common.clear")}
        </Button>

        <Button
          size="small"
          variant="contained"
          color={isTrash ? "success" : "error"}
          startIcon={
            isTrash ? (
              <RestoreFromTrashIcon fontSize="small" />
            ) : (
              <DeleteIcon fontSize="small" />
            )
          }
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
        await restoreCustomerByUuid(actionUuid);
        showSnackbar({ message: t("common.restoredSuccess"), severity: "success" });
      } else {
        await deleteCustomerByUuid(actionUuid);
        showSnackbar({ message: t("common.deletedSuccess"), severity: "success" });
      }

      onRefresh();
    } catch (err: any) {
      showSnackbar({
        message:
          err?.response?.data?.detail ??
          (isTrash ? t("common.restoreFailed") : t("common.deleteFailed")),
        severity: "error",
      });
    } finally {
      setActionLoading(false);
      setActionUuid(null);
    }
  }

  /* ---------- MOBILE ---------- */
  if (isMobile) {
    return (
      <Box>
        {selectionBar}

        {loading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} height={120} sx={{ mb: 2 }} />
          ))
        ) : rows.length ? (
          rows.map((row) => (
            <Paper key={row.uuid} sx={{ mb: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Checkbox
                      size="small"
                      checked={selected.has(row.uuid)}
                      onChange={() => toggleRow(row.uuid)}
                    />
                    <Typography fontWeight={600}>{row.name}</Typography>
                  </Stack>
                </Stack>

                <Typography variant="caption">{row.mobile}</Typography>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption">{row.nationality || "-"}</Typography>
                  <Typography variant="caption">{formatDate(row.created_at)}</Typography>
                </Stack>
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
          component="div"
          count={total}
          page={page - 1}
          rowsPerPage={pageSize}
          onPageChange={(_, p) => onPageChange(p + 1)}
          onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
        />
        <ConfirmDialog
          open={Boolean(actionUuid)}
          title={isTrash ? t("common.restore") : t("common.delete")}
          message={
            isTrash ? t("common.restoreConfirmMessage") : t("common.deleteConfirmMessage")
          }
          confirmText={isTrash ? t("common.restore") : t("common.delete")}
          loading={actionLoading}
          onClose={() => setActionUuid(null)}
          onConfirm={handleConfirmAction}
        />
        <ConfirmDialog
          open={bulkConfirmOpen}
          title={isTrash ? t("common.restore") : t("common.delete")}
          message={
            isTrash
              ? t("common.restoreBulkConfirmMessage", { count: selected.size })
              : t("common.deleteBulkConfirmMessage", { count: selected.size })
          }
          confirmText={isTrash ? t("common.restore") : t("common.delete")}
          loading={bulkLoading}
          onClose={() => setBulkConfirmOpen(false)}
          onConfirm={handleBulkConfirm}
        />
      </Box>
    );
  }

  /* ---------- DESKTOP ---------- */
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
                  key={col.id}
                  id={col.id as string}
                  label={col.label}
                  sortable={col.sortable}
                  align={col.align}
                  minWidth={col.minWidth}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={onSortChange}
                />
              ))}
              <TableCell align="right">{t("common.actions")}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading &&
              [...Array(pageSize)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <Skeleton height={40} />
                  </TableCell>
                </TableRow>
              ))}

            {!loading &&
              rows.map((row) => (
                <TableRow key={row.uuid} hover selected={selected.has(row.uuid)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selected.has(row.uuid)}
                      onChange={() => toggleRow(row.uuid)}
                    />
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.mobile}</TableCell>
                  <TableCell>{row.email || "-"}</TableCell>
                  <TableCell>{row.nationality || "-"}</TableCell>
                  <TableCell>{row.passport_no || "-"}</TableCell>
                  <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() =>
                        navigate(
                          isTrash
                            ? `/app/crm/customers/${row.uuid}?is_deleted=true`
                            : `/app/crm/customers/${row.uuid}`,
                        )
                      }
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>

                    {!isTrash && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/app/crm/customers/${row.uuid}/edit`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setActionUuid(row.uuid)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}

                    {isTrash && (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => setActionUuid(row.uuid)}
                      >
                        <RestoreFromTrashIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        rowsPerPage={pageSize}
        onPageChange={(_, p) => onPageChange(p + 1)}
        onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
      />
      <ConfirmDialog
        open={Boolean(actionUuid)}
        title={isTrash ? t("common.restore") : t("common.delete")}
        message={
          isTrash ? t("common.restoreConfirmMessage") : t("common.deleteConfirmMessageShort")
        }
        confirmText={isTrash ? t("common.restore") : t("common.delete")}
        loading={actionLoading}
        onClose={() => setActionUuid(null)}
        onConfirm={handleConfirmAction}
      />
      <ConfirmDialog
        open={bulkConfirmOpen}
        title={isTrash ? t("common.restore") : t("common.delete")}
        message={
          isTrash
            ? t("common.restoreBulkConfirmMessage", { count: selected.size })
            : t("common.deleteBulkConfirmMessage", { count: selected.size })
        }
        confirmText={isTrash ? t("common.restore") : t("common.delete")}
        loading={bulkLoading}
        onClose={() => setBulkConfirmOpen(false)}
        onConfirm={handleBulkConfirm}
      />
    </>
  );
}
