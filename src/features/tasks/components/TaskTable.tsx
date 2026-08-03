// src/features/tasks/components/TaskTable.tsx
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

import type { TaskListItem } from "../task.types";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import DropdownColorChip from "../../../components/common/DropdownColorChip";
import SortableTableCell from "../../../components/common/SortableTableCell";
import { useLocalizationProfile } from "../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../utils/formatters/localization";
import { bulkDeleteTasks, bulkRestoreTasks, deleteTaskByUuid, restoreTaskByUuid } from "../task.api";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../utils/errorMessage";

interface Props {
  rows: TaskListItem[];
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
  showAssignedTo?: boolean;
}

function getColumns(t: TFunction, showAssignedTo: boolean) {
  const cols = [
    { id: "title", label: t("tasks.title"), minWidth: 200 },
    { id: "status", label: t("common.status"), minWidth: 110 },
    { id: "priority", label: t("common.priority"), minWidth: 110 },
    { id: "due_date", label: t("tasks.dueDate"), sortable: true, minWidth: 130 },
  ];
  if (showAssignedTo) cols.push({ id: "assigned_to_name", label: t("tasks.assignedTo"), minWidth: 150 });
  cols.push({ id: "linked_entity_label", label: t("tasks.linkedTo"), minWidth: 150 });
  return cols;
}

export default function TaskTable({
  rows, loading, page, pageSize, total, isTrash, sortBy, sortOrder, onSortChange,
  onPageChange, onPageSizeChange, onRefresh, showAssignedTo = false,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { t } = useTranslation();
  const columns = useMemo(() => getColumns(t, showAssignedTo), [t, showAssignedTo]);
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
      const result = isTrash ? await bulkRestoreTasks(uuids) : await bulkDeleteTasks(uuids);
      showSnackbar({ message: result.message, severity: "success" });
      setSelected(new Set());
      onRefresh();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, isTrash ? t("common.restoreSelectedFailed") : t("common.deleteSelectedFailed")), severity: "error" });
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
        await restoreTaskByUuid(actionUuid);
        showSnackbar({ message: t("common.restoredSuccess"), severity: "success" });
      } else {
        await deleteTaskByUuid(actionUuid);
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

  const colCount = columns.length + 2; // + checkbox + actions

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
                    <Typography fontWeight={600} sx={{ cursor: "pointer" }} onClick={() => navigate(`/app/tasks/${row.uuid}`)}>
                      {row.title}
                    </Typography>
                  </Stack>
                  <DropdownColorChip dropdownName="task_status" value={row.status} />
                </Stack>
                <Typography variant="caption">{row.assigned_to_name} &bull; {row.due_date ? formatDate(row.due_date) : "-"}</Typography>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="flex-end">
                  {isTrash ? (
                    <IconButton size="small" color="success" onClick={() => setActionUuid(row.uuid)}>
                      <RestoreFromTrashIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => navigate(`/app/tasks/${row.uuid}`)}><VisibilityIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => navigate(`/app/tasks/${row.uuid}/edit`)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setActionUuid(row.uuid)}><DeleteIcon fontSize="small" /></IconButton>
                    </Stack>
                  )}
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
        <TablePagination component="div" count={total} page={page - 1} rowsPerPage={pageSize}
          onPageChange={(_, p) => onPageChange(p + 1)} onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))} />
        <ConfirmDialog open={Boolean(actionUuid)} title={isTrash ? t("common.restore") : t("common.delete")}
          message={isTrash ? t("common.restoreConfirmMessage") : t("common.deleteConfirmMessage")}
          confirmText={isTrash ? t("common.restore") : t("common.delete")} loading={actionLoading}
          onClose={() => setActionUuid(null)} onConfirm={handleConfirmAction} />
        <ConfirmDialog open={bulkConfirmOpen} title={isTrash ? t("common.restore") : t("common.delete")}
          message={isTrash ? t("common.restoreBulkConfirmMessage", { count: selected.size }) : t("common.deleteBulkConfirmMessage", { count: selected.size })}
          confirmText={isTrash ? t("common.restore") : t("common.delete")} loading={bulkLoading}
          onClose={() => setBulkConfirmOpen(false)} onConfirm={handleBulkConfirm} />
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
                <SortableTableCell key={col.id} id={col.id} label={col.label} sortable={"sortable" in col ? col.sortable : undefined}
                  minWidth={col.minWidth} sortBy={sortBy} sortOrder={sortOrder} onSort={onSortChange} />
              ))}
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>{t("common.actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && [...Array(pageSize)].map((_, i) => (
              <TableRow key={i}><TableCell colSpan={colCount}><Skeleton height={40} /></TableCell></TableRow>
            ))}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={colCount}>
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
                <TableCell sx={{ cursor: "pointer" }} onClick={() => navigate(`/app/tasks/${row.uuid}`)}>{row.title}</TableCell>
                <TableCell><DropdownColorChip dropdownName="task_status" value={row.status} /></TableCell>
                <TableCell><DropdownColorChip dropdownName="task_priority" value={row.priority} /></TableCell>
                <TableCell>{row.due_date ? formatDate(row.due_date) : "-"}</TableCell>
                {showAssignedTo && <TableCell>{row.assigned_to_name || "-"}</TableCell>}
                <TableCell>{row.linked_entity_label || "-"}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  {isTrash ? (
                    <IconButton size="small" color="success" onClick={() => setActionUuid(row.uuid)}>
                      <RestoreFromTrashIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <IconButton size="small" onClick={() => navigate(`/app/tasks/${row.uuid}`)}><VisibilityIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => navigate(`/app/tasks/${row.uuid}/edit`)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setActionUuid(row.uuid)}><DeleteIcon fontSize="small" /></IconButton>
                    </Stack>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination component="div" count={total} page={page - 1} rowsPerPage={pageSize}
        onPageChange={(_, p) => onPageChange(p + 1)} onRowsPerPageChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))} />

      <ConfirmDialog open={Boolean(actionUuid)} title={isTrash ? t("common.restore") : t("common.delete")}
        message={isTrash ? t("common.restoreConfirmMessage") : t("common.deleteConfirmMessageShort")}
        confirmText={isTrash ? t("common.restore") : t("common.delete")} loading={actionLoading}
        onClose={() => setActionUuid(null)} onConfirm={handleConfirmAction} />
      <ConfirmDialog open={bulkConfirmOpen} title={isTrash ? t("common.restore") : t("common.delete")}
        message={isTrash ? t("common.restoreBulkConfirmMessage", { count: selected.size }) : t("common.deleteBulkConfirmMessage", { count: selected.size })}
        confirmText={isTrash ? t("common.restore") : t("common.delete")} loading={bulkLoading}
        onClose={() => setBulkConfirmOpen(false)} onConfirm={handleBulkConfirm} />
    </>
  );
}
