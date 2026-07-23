// src/features/inventory/inventoryStock/components/InventoryStockTable.tsx

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

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InboxIcon from "@mui/icons-material/Inbox";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import type { InventoryStockListItem } from "../inventoryStock.types";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import SortableTableCell from "../../../../components/common/SortableTableCell";
import {
  bulkDeleteInventoryStocks,
  bulkRestoreInventoryStocks,
  deleteInventoryStockByUuid,
  restoreInventoryStockByUuid,
} from "../inventoryStock.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

interface Props {
  rows: InventoryStockListItem[];
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
  id: keyof InventoryStockListItem | string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  minWidth?: number;
}

function getColumns(t: TFunction): TableColumn[] {
  return [
    { id: "inventory_code", label: t("inventoryStock.colCode"), sortable: true, minWidth: 120 },
    { id: "inventory_name", label: t("inventoryStock.colName"), sortable: true, minWidth: 200 },
    { id: "service_type", label: t("inventoryStock.colServiceType"), sortable: true, minWidth: 120 },
    { id: "contract_code", label: t("inventoryStock.colContract"), minWidth: 150 },
    { id: "total_qty", label: t("inventoryStock.colTotalQty"), sortable: true, minWidth: 90, align: "right" },
    { id: "booked_qty", label: t("inventoryStock.colBookedQty"), minWidth: 90, align: "right" },
    { id: "available_qty", label: t("inventoryStock.colAvailableQty"), minWidth: 100, align: "right" },
    { id: "status", label: t("inventoryStock.colStatus"), sortable: true, minWidth: 100 },
  ];
}

export default function InventoryStockTable({
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
        ? await bulkRestoreInventoryStocks(uuids)
        : await bulkDeleteInventoryStocks(uuids);

      showSnackbar({ message: result.message, severity: "success" });
      setSelected(new Set());
      onRefresh();
    } catch (err: any) {
      showSnackbar({
        message: getErrorMessage(
          err,
          isTrash ? t("common.restoreSelectedFailed") : t("common.deleteSelectedFailed"),
        ),
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
            isTrash ? <RestoreFromTrashIcon fontSize="small" /> : <DeleteIcon fontSize="small" />
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
        await restoreInventoryStockByUuid(actionUuid);
        showSnackbar({ message: t("common.restoredSuccess"), severity: "success" });
      } else {
        await deleteInventoryStockByUuid(actionUuid);
        showSnackbar({ message: t("common.deletedSuccess"), severity: "success" });
      }

      onRefresh();
    } catch (err: any) {
      showSnackbar({
        message: getErrorMessage(
          err,
          isTrash ? t("common.restoreFailed") : t("common.deleteFailed"),
        ),
        severity: "error",
      });
    } finally {
      setActionLoading(false);
      setActionUuid(null);
    }
  }

  const renderStatusChip = (status?: string) => (
    <Chip
      size="small"
      label={status || t("common.active")}
      color={status === "Active" || !status ? "success" : "default"}
    />
  );

  const rowActions = (row: InventoryStockListItem) => (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      <IconButton
        size="small"
        onClick={() =>
          navigate(
            isTrash
              ? `/app/inventory/stock/${row.uuid}?is_deleted=true`
              : `/app/inventory/stock/${row.uuid}`,
          )
        }
      >
        <VisibilityIcon fontSize="small" />
      </IconButton>

      {!isTrash && (
        <>
          <IconButton size="small" onClick={() => navigate(`/app/inventory/stock/${row.uuid}/edit`)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={() => setActionUuid(row.uuid)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </>
      )}
      {isTrash && (
        <IconButton size="small" color="success" onClick={() => setActionUuid(row.uuid)}>
          <RestoreFromTrashIcon fontSize="small" />
        </IconButton>
      )}
    </Stack>
  );

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
                    <Checkbox
                      size="small"
                      checked={selected.has(row.uuid)}
                      onChange={() => toggleRow(row.uuid)}
                    />
                    <Typography fontWeight={600}>{row.inventory_name}</Typography>
                  </Stack>
                  {renderStatusChip(row.status)}
                </Stack>

                <Typography variant="caption">
                  {row.inventory_code} &bull; {row.service_type} &bull; {row.contract_code}
                </Typography>
                <Typography variant="caption" display="block">
                  {t("inventoryStock.colAvailableQty")}: {row.available_qty} / {row.total_qty}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" justifyContent="flex-end" alignItems="center">
                  {rowActions(row)}
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
          message={isTrash ? t("common.restoreConfirmMessage") : t("common.deleteConfirmMessage")}
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
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                {t("common.actions")}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading &&
              [...Array(pageSize)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={9}>
                    <Skeleton height={40} />
                  </TableCell>
                </TableRow>
              ))}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box textAlign="center" py={5}>
                    <InboxIcon sx={{ fontSize: 48, opacity: 0.4 }} />
                    <Typography>{t("common.noRecordsFound")}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              rows.map((row) => (
                <TableRow key={row.uuid} hover selected={selected.has(row.uuid)}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={selected.has(row.uuid)} onChange={() => toggleRow(row.uuid)} />
                  </TableCell>
                  <TableCell>{row.inventory_code}</TableCell>
                  <TableCell>{row.inventory_name}</TableCell>
                  <TableCell>{row.service_type}</TableCell>
                  <TableCell>{row.contract_code}</TableCell>
                  <TableCell align="right">{row.total_qty}</TableCell>
                  <TableCell align="right">{row.booked_qty}</TableCell>
                  <TableCell align="right">{row.available_qty}</TableCell>
                  <TableCell>{renderStatusChip(row.status)}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    {rowActions(row)}
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
        message={isTrash ? t("common.restoreConfirmMessage") : t("common.deleteConfirmMessageShort")}
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
