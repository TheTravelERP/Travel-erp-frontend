// src/features/settings/notificationTemplates/components/NotificationTemplateTable.tsx

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
  Tooltip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InboxIcon from "@mui/icons-material/Inbox";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import type { NotificationTemplateListItem } from "../notificationTemplate.types";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import SortableTableCell from "../../../../components/common/SortableTableCell";
import {
  bulkDeleteNotificationTemplates,
  bulkRestoreNotificationTemplates,
  deleteNotificationTemplateByUuid,
  restoreNotificationTemplateByUuid,
  duplicateNotificationTemplate,
} from "../notificationTemplate.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

interface Props {
  rows: NotificationTemplateListItem[];
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

function getColumns(t: TFunction) {
  return [
    { id: "template_name", label: t("notificationTemplate.colName"), sortable: true, minWidth: 180 },
    { id: "template_code", label: t("notificationTemplate.colCode"), sortable: true, minWidth: 140 },
    { id: "module", label: t("notificationTemplate.colModule"), minWidth: 110 },
    { id: "channel", label: t("notificationTemplate.colChannel"), sortable: true, minWidth: 110 },
    { id: "is_active", label: t("notificationTemplate.colStatus"), minWidth: 100 },
  ];
}

export default function NotificationTemplateTable({
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
      const result = isTrash
        ? await bulkRestoreNotificationTemplates(uuids)
        : await bulkDeleteNotificationTemplates(uuids);
      showSnackbar({ message: result.message, severity: "success" });
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

  async function handleConfirmAction() {
    if (!actionUuid) return;
    try {
      setActionLoading(true);
      if (isTrash) {
        await restoreNotificationTemplateByUuid(actionUuid);
        showSnackbar({ message: t("common.restoredSuccess"), severity: "success" });
      } else {
        await deleteNotificationTemplateByUuid(actionUuid);
        showSnackbar({ message: t("common.deletedSuccess"), severity: "success" });
      }
      onRefresh();
    } catch (err: any) {
      showSnackbar({
        message: getErrorMessage(err, isTrash ? t("common.restoreFailed") : t("common.deleteFailed")),
        severity: "error",
      });
    } finally {
      setActionLoading(false);
      setActionUuid(null);
    }
  }

  async function handleDuplicate(uuid: string) {
    try {
      await duplicateNotificationTemplate(uuid);
      showSnackbar({ message: t("notificationTemplate.duplicateSuccess"), severity: "success" });
      onRefresh();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("notificationTemplate.duplicateFailed")), severity: "error" });
    }
  }

  const channelLabel = (channel: string) =>
    channel === "EMAIL"
      ? t("communicationProvider.categoryEmail")
      : channel === "WHATSAPP"
        ? t("communicationProvider.categoryWhatsapp")
        : t("communicationProvider.categorySms");

  const selectionBar = selected.size > 0 && (
    <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ p: 1.5, mb: 1, borderRadius: 1, bgcolor: "action.selected" }}>
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
          startIcon={isTrash ? <RestoreFromTrashIcon fontSize="small" /> : <DeleteIcon fontSize="small" />}
          onClick={() => setBulkConfirmOpen(true)}
        >
          {isTrash ? t("common.restoreSelected") : t("common.deleteSelected")}
        </Button>
      </Stack>
    </Box>
  );

  const rowActions = (row: NotificationTemplateListItem) => (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      {!isTrash && (
        <>
          <Tooltip title={t("common.clone")}>
            <IconButton size="small" onClick={() => handleDuplicate(row.uuid)}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={() => navigate(`/app/settings/notifications/${row.uuid}/edit`)}>
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
                    <Checkbox size="small" checked={selected.has(row.uuid)} onChange={() => toggleRow(row.uuid)} />
                    <Typography fontWeight={600}>{row.template_name}</Typography>
                  </Stack>
                  <Chip size="small" label={row.is_active ? t("common.active") : t("common.inactive")} color={row.is_active ? "success" : "default"} />
                </Stack>
                <Typography variant="caption">
                  {row.template_code} &bull; {channelLabel(row.channel)} &bull; {row.module}
                </Typography>
                <Divider sx={{ my: 1 }} />
                {rowActions(row)}
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
        {dialogs()}
      </Box>
    );
  }

  function dialogs() {
    return (
      <>
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
                  id={col.id}
                  label={col.label}
                  sortable={col.sortable}
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
                  <TableCell colSpan={7}>
                    <Skeleton height={40} />
                  </TableCell>
                </TableRow>
              ))}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
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
                  <TableCell>{row.template_name}</TableCell>
                  <TableCell>{row.template_code}</TableCell>
                  <TableCell>{row.module}</TableCell>
                  <TableCell>{channelLabel(row.channel)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={row.is_active ? t("common.active") : t("common.inactive")} color={row.is_active ? "success" : "default"} />
                  </TableCell>
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
      {dialogs()}
    </>
  );
}
