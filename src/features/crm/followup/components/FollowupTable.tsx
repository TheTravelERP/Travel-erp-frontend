// src/features/crm/followup/components/FollowupTable.tsx

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
  alpha,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InboxIcon from "@mui/icons-material/Inbox";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import type { FollowupListItem } from "../followup.types";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import DropdownColorChip from "../../../../components/common/DropdownColorChip";
import SortableTableCell from "../../../../components/common/SortableTableCell";
import { useLocalizationProfile } from "../../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../../utils/formatters/localization";
import {
  bulkDeleteFollowups,
  bulkRestoreFollowups,
  deleteFollowupByUuid,
  restoreFollowupByUuid,
} from "../followup.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";
import { getErrorMessage } from "../../../../utils/errorMessage";

interface Props {
  rows: FollowupListItem[];
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
  id: keyof FollowupListItem | string;
  label: string;
  sortable?: boolean;
  minWidth?: number;
}

function getColumns(t: TFunction): TableColumn[] {
  return [
    { id: "followup_datetime", label: t("followup.colFollowupDate"), sortable: true, minWidth: 150 },
    { id: "followup_type", label: t("followup.colType"), sortable: true, minWidth: 130 },
    { id: "customer_name", label: t("followup.colCustomer"), minWidth: 170 },
    { id: "quotation_no", label: t("followup.colQuotationNo"), minWidth: 130 },
    { id: "discussion_notes", label: t("followup.colDiscussion"), minWidth: 220 },
    { id: "outcome", label: t("followup.colOutcome"), minWidth: 130 },
    { id: "next_followup_datetime", label: t("followup.colNextFollowup"), sortable: true, minWidth: 150 },
    { id: "assigned_user_name", label: t("followup.colAssignedUser"), minWidth: 150 },
    { id: "status", label: t("followup.colStatus"), sortable: true, minWidth: 110 },
    { id: "priority", label: t("followup.colPriority"), sortable: true, minWidth: 110 },
  ];
}

// A follow-up whose own date/time has passed and is still sitting in
// Pending means it was never actioned — flag the row so it can't be
// missed while scrolling past it.
function isOverdueAndPending(row: FollowupListItem): boolean {
  return row.status === "Pending" && new Date(row.followup_datetime) < new Date();
}

export default function FollowupTable({
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
  // Same card/table breakpoint as EnquiryTable.
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { t } = useTranslation();
  const perms = usePermission("crm.followups");
  const columns = useMemo(() => getColumns(t), [t]);
  const localizationProfile = useLocalizationProfile();
  const { formatDateTime } = useMemo(() => createFormatters(localizationProfile), [localizationProfile]);
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
        ? await bulkRestoreFollowups(uuids)
        : await bulkDeleteFollowups(uuids);

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
        await restoreFollowupByUuid(actionUuid);
        showSnackbar({ message: t("common.restoredSuccess"), severity: "success" });
      } else {
        await deleteFollowupByUuid(actionUuid);
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
    <DropdownColorChip dropdownName="followup_status" value={status} />
  );

  const renderPriorityChip = (priority?: string) => (
    <DropdownColorChip dropdownName="followup_priority" value={priority} />
  );

  const rowActions = (row: FollowupListItem) => (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      <IconButton
        size="small"
        onClick={() =>
          navigate(
            isTrash
              ? `/app/crm/followups/${row.uuid}?is_deleted=true`
              : `/app/crm/followups/${row.uuid}`,
          )
        }
      >
        <VisibilityIcon fontSize="small" />
      </IconButton>

      {!isTrash && (
        <>
          {perms.can_edit && (
            <IconButton size="small" onClick={() => navigate(`/app/crm/followups/${row.uuid}/edit`)}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {perms.can_delete && (
            <IconButton size="small" color="error" onClick={() => setActionUuid(row.uuid)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </>
      )}
      {isTrash && perms.can_delete && (
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
            <Paper
              key={row.uuid}
              sx={{
                mb: 1,
                ...(!isTrash && isOverdueAndPending(row) && {
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                  borderLeft: "4px solid",
                  borderColor: "warning.main",
                }),
              }}
            >
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" rowGap={0.5}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, flex: "1 1 auto" }}>
                    {perms.can_delete && (
                      <Checkbox
                        size="small"
                        checked={selected.has(row.uuid)}
                        onChange={() => toggleRow(row.uuid)}
                      />
                    )}
                    <Typography fontWeight={600} noWrap sx={{ minWidth: 0 }}>
                      {row.customer_name || row.enquiry_no}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                    {renderPriorityChip(row.priority)}
                    {renderStatusChip(row.status)}
                  </Stack>
                </Stack>

                <Typography variant="caption" component="div">
                  {row.followup_type} &bull; {formatDateTime(row.followup_datetime)}
                </Typography>
                <Typography variant="caption" color="text.secondary" component="div" noWrap>
                  {row.discussion_notes}
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
                {perms.can_delete && (
                  <Checkbox
                    indeterminate={selected.size > 0 && selected.size < rows.length}
                    checked={rows.length > 0 && selected.size === rows.length}
                    onChange={toggleSelectAll}
                    disabled={rows.length === 0}
                  />
                )}
              </TableCell>
              {columns.map((col) => (
                <SortableTableCell
                  key={col.id}
                  id={col.id as string}
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
                  <TableCell colSpan={11}>
                    <Skeleton height={40} />
                  </TableCell>
                </TableRow>
              ))}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={10}>
                  <Box textAlign="center" py={5}>
                    <InboxIcon sx={{ fontSize: 48, opacity: 0.4 }} />
                    <Typography>{t("common.noRecordsFound")}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              rows.map((row) => (
                <TableRow
                  key={row.uuid}
                  hover
                  selected={selected.has(row.uuid)}
                  sx={
                    !isTrash && isOverdueAndPending(row)
                      ? {
                          bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                          borderLeft: "4px solid",
                          borderColor: "warning.main",
                        }
                      : undefined
                  }
                >
                  <TableCell padding="checkbox">
                    {perms.can_delete && (
                      <Checkbox checked={selected.has(row.uuid)} onChange={() => toggleRow(row.uuid)} />
                    )}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {formatDateTime(row.followup_datetime)}
                  </TableCell>
                  <TableCell>{row.followup_type}</TableCell>
                  <TableCell>
                    {row.customer_name}
                    {row.customer_mobile && (
                      <Typography variant="caption" color="text.secondary" component="div">
                        {row.customer_mobile}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{row.quotation_no || "-"}</TableCell>
                  <TableCell sx={{ maxWidth: 260 }}>
                    <Typography variant="body2" noWrap title={row.discussion_notes}>
                      {row.discussion_notes}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.outcome || "-"}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {row.next_followup_datetime ? formatDateTime(row.next_followup_datetime) : "-"}
                  </TableCell>
                  <TableCell>{row.assigned_user_name || "-"}</TableCell>
                  <TableCell>{renderStatusChip(row.status)}</TableCell>
                  <TableCell>{renderPriorityChip(row.priority)}</TableCell>
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
