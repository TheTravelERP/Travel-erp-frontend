// src/features/enquiry/components/EnquiryTable.tsx

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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InboxIcon from "@mui/icons-material/Inbox";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import EventRepeatIcon from "@mui/icons-material/EventRepeat";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import DescriptionIcon from "@mui/icons-material/Description";
import ForumIcon from "@mui/icons-material/Forum";
import ChecklistIcon from "@mui/icons-material/Checklist";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CancelIcon from "@mui/icons-material/Cancel";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import type { EnquiryListItem } from "../enquiry.types";
import { useLocalizationProfile } from "../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../utils/formatters/localization";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import DropdownColorChip from "../../../components/common/DropdownColorChip";
import SortableTableCell from "../../../components/common/SortableTableCell";
import RowActionsMenu, { type RowActionGroup } from "../../../components/common/RowActionsMenu";
import EntityAutocomplete from "../../../components/common/EntityAutocomplete";
import {
  bulkDeleteEnquiries,
  bulkRestoreEnquiries,
  deleteEnquiryByUuid,
  restoreEnquiryByUuid,
  cloneEnquiry,
  markEnquiryLost,
  reopenEnquiry,
  assignEnquiryAgent,
  assignEnquiryBranch,
} from "../enquiry.api";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../hooks/usePermission";
import { getErrorMessage } from "../../../utils/errorMessage";

/* ================= TYPES ================= */

interface Props {
  rows: EnquiryListItem[];
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
  id: keyof EnquiryListItem | string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  minWidth?: number;
  format?: "date" | "currency" | "chip";
}

/* ================= COLUMNS, COLORS ================= */

function getColumns(t: TFunction): TableColumn[] {
  return [
    {
      id: "enquiry_no",
      label: t("enquiry.colEnquiryNo"),
      sortable: true,
      minWidth: 90,
    },
    {
      id: "customer_name",
      label: t("enquiry.colCustomer"),
      sortable: true,
      minWidth: 200,
    },
    {
      id: "customer_mobile",
      label: t("enquiry.colMobile"),
      sortable: true,
      minWidth: 200,
    },
    {
      id: "package_name",
      label: t("enquiry.colPackage"),
      sortable: true,
      minWidth: 220,
    },
    {
      id: "pax_count",
      label: t("enquiry.colPax"),
      sortable: true,
      align: "center",
      minWidth: 80,
    },
    {
      id: "enquiry_priority",
      label: t("common.priority"),
      sortable: true,
      format: "chip",
      minWidth: 110,
    },
    {
      id: "conversion_status",
      label: t("common.status"),
      sortable: true,
      format: "chip",
      minWidth: 120,
    },
    {
      id: "created_at",
      label: t("common.createdOn"),
      sortable: true,
      format: "date",
      minWidth: 140,
    },
  ];
}

function renderStatusChip(status: string) {
  return <DropdownColorChip dropdownName="enquiry_status" value={status} />;
}

function renderPriorityChip(priority: string) {
  return <DropdownColorChip dropdownName="enquiry_priority" value={priority} />;
}

/* ================= COMPONENT ================= */

export default function EnquiryTable({
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
  const localizationProfile = useLocalizationProfile();
  const { formatDate } = useMemo(() => createFormatters(localizationProfile), [localizationProfile]);
  const [actionUuid, setActionUuid] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();
  const [actionLoading, setActionLoading] = useState(false);

  const followupPerms = usePermission("crm.followups");
  const quotationPerms = usePermission("crm.quotations");
  const taskPerms = usePermission("tasks.my");
  const bookingPerms = usePermission("packages.bookings");
  const enquiryPerms = usePermission("crm.enquiries");

  const [cloneUuid, setCloneUuid] = useState<string | null>(null);
  const [cloneLoading, setCloneLoading] = useState(false);

  const [reopenUuid, setReopenUuid] = useState<string | null>(null);
  const [reopenLoading, setReopenLoading] = useState(false);

  const [markLostUuid, setMarkLostUuid] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState("");
  const [markLostLoading, setMarkLostLoading] = useState(false);

  const [assignUuid, setAssignUuid] = useState<string | null>(null);
  const [assignAgentUuid, setAssignAgentUuid] = useState<string | null>(null);
  const [assignBranchUuid, setAssignBranchUuid] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);

  async function handleCloneConfirm() {
    if (!cloneUuid) return;
    try {
      setCloneLoading(true);
      const cloned = await cloneEnquiry(cloneUuid);
      showSnackbar({ message: t("enquiry.cloneSuccess", { enquiryNo: cloned.enquiry_no }), severity: "success" });
      setCloneUuid(null);
      onRefresh();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setCloneLoading(false);
    }
  }

  async function handleReopenConfirm() {
    if (!reopenUuid) return;
    try {
      setReopenLoading(true);
      await reopenEnquiry(reopenUuid);
      showSnackbar({ message: t("enquiry.reopenSuccess"), severity: "success" });
      setReopenUuid(null);
      onRefresh();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setReopenLoading(false);
    }
  }

  async function handleMarkLostConfirm() {
    if (!markLostUuid) return;
    try {
      setMarkLostLoading(true);
      await markEnquiryLost(markLostUuid, lostReason);
      showSnackbar({ message: t("enquiry.markLostSuccess"), severity: "success" });
      setMarkLostUuid(null);
      setLostReason("");
      onRefresh();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setMarkLostLoading(false);
    }
  }

  async function handleAssignConfirm() {
    if (!assignUuid || !assignAgentUuid || !assignBranchUuid) return;
    try {
      setAssignLoading(true);
      await assignEnquiryAgent(assignUuid, assignAgentUuid);
      await assignEnquiryBranch(assignUuid, assignBranchUuid);
      showSnackbar({ message: t("enquiry.assignSuccess"), severity: "success" });
      setAssignUuid(null);
      setAssignAgentUuid(null);
      setAssignBranchUuid(null);
      onRefresh();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setAssignLoading(false);
    }
  }

  function getRowActionGroups(row: EnquiryListItem): RowActionGroup[] {
    return [
      [
        {
          key: "view",
          label: t("common.view"),
          icon: <VisibilityIcon fontSize="small" />,
          onClick: () => navigate(`/app/enquiries/${row.uuid}`),
        },
        {
          key: "edit",
          label: t("common.edit"),
          icon: <EditIcon fontSize="small" />,
          onClick: () => navigate(`/app/enquiries/${row.uuid}/edit`),
        },
      ],
      [
        {
          key: "followups",
          label: t("enquiry.actionFollowups"),
          icon: <EventRepeatIcon fontSize="small" />,
          show: followupPerms.can_view,
          onClick: () => navigate(`/app/crm/followups?enquiry_uuid=${row.uuid}`),
        },
        {
          key: "create-quotation",
          label: t("enquiry.actionCreateQuotation"),
          icon: <RequestQuoteIcon fontSize="small" />,
          show: quotationPerms.can_create,
          onClick: () => navigate(`/app/crm/quotations/create?enquiry_uuid=${row.uuid}`),
        },
        {
          key: "documents",
          label: t("enquiry.actionDocuments"),
          icon: <DescriptionIcon fontSize="small" />,
          disabled: true,
          disabledReason: t("common.comingSoon"),
        },
        {
          key: "communication",
          label: t("enquiry.actionCommunication"),
          icon: <ForumIcon fontSize="small" />,
          disabled: true,
          disabledReason: t("common.comingSoon"),
        },
        {
          key: "tasks",
          label: t("enquiry.actionTasks"),
          icon: <ChecklistIcon fontSize="small" />,
          show: taskPerms.can_view,
          onClick: () => navigate("/app/tasks/my"),
        },
      ],
      [
        {
          key: "convert-to-booking",
          label: t("enquiry.actionConvertToBooking"),
          icon: <BookOnlineIcon fontSize="small" />,
          show: bookingPerms.can_create,
          onClick: () => navigate(`/app/bookings/list/create?enquiry_uuid=${row.uuid}`),
        },
        {
          key: "clone",
          label: t("enquiry.actionClone"),
          icon: <ContentCopyIcon fontSize="small" />,
          show: enquiryPerms.can_edit,
          onClick: () => setCloneUuid(row.uuid),
        },
        {
          key: "assign",
          label: t("enquiry.assignSalesExecutiveAndBranch"),
          icon: <AssignmentIndIcon fontSize="small" />,
          show: enquiryPerms.can_edit,
          onClick: () => { setAssignAgentUuid(null); setAssignBranchUuid(null); setAssignUuid(row.uuid); },
        },
        {
          key: "mark-lost",
          label: t("enquiry.actionMarkLost"),
          icon: <CancelIcon fontSize="small" />,
          color: "error",
          show: enquiryPerms.can_edit && !["Lost", "Converted"].includes(row.conversion_status),
          onClick: () => setMarkLostUuid(row.uuid),
        },
        {
          key: "reopen",
          label: t("enquiry.actionReopen"),
          icon: <RestartAltIcon fontSize="small" />,
          show: enquiryPerms.can_edit && row.conversion_status === "Lost",
          onClick: () => setReopenUuid(row.uuid),
        },
      ],
    ];
  }

  /* ---------- BULK SELECTION ---------- */
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Selection is page-scoped — clear it whenever the visible rows change
  // (page navigation, filters, or switching between list/trash).
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
        ? await bulkRestoreEnquiries(uuids)
        : await bulkDeleteEnquiries(uuids);

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

  // FUnctions

  async function handleConfirmAction() {
    if (!actionUuid) return;

    try {
      setActionLoading(true);

      if (isTrash) {
        await restoreEnquiryByUuid(actionUuid);
        showSnackbar({
          message: t("common.restoredSuccess"),
          severity: "success",
        });
      } else {
        await deleteEnquiryByUuid(actionUuid);
        showSnackbar({
          message: t("common.deletedSuccess"),
          severity: "success",
        });
      }

      // Refresh the current list/trash view
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
                    <Typography fontWeight={600}>{row.customer_name}</Typography>
                  </Stack>
                  {renderStatusChip(row.conversion_status)}
                </Stack>

                <Typography variant="caption">{row.package_name}</Typography>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption">
                    {t("common.paxLabel", { count: row.pax_count })}
                  </Typography>
                  <Typography variant="caption">
                    {formatDate(row.created_at)}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" justifyContent="flex-end" alignItems="center">
                  {isTrash ? (
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => setActionUuid(row.uuid)}
                    >
                      <RestoreFromTrashIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <RowActionsMenu
                      ariaLabel={t("common.actions")}
                      groups={[
                        ...getRowActionGroups(row),
                        [
                          {
                            key: "delete",
                            label: t("common.delete"),
                            icon: <DeleteIcon fontSize="small" />,
                            color: "error",
                            onClick: () => setActionUuid(row.uuid),
                          },
                        ],
                      ]}
                    />
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

        <TablePagination
          component="div"
          count={total}
          page={page - 1}
          rowsPerPage={pageSize}
          onPageChange={(_, p) => onPageChange(p + 1)}
          onRowsPerPageChange={(e) =>
            onPageSizeChange(parseInt(e.target.value, 10))
          }
        />
        <ConfirmDialog
          open={Boolean(actionUuid)}
          title={isTrash ? t("common.restore") : t("common.delete")}
          message={
            isTrash
              ? t("common.restoreConfirmMessage")
              : t("common.deleteConfirmMessage")
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
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                {t("common.actions")}
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading &&
              [...Array(pageSize)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={12}>
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
                  <TableCell>{row.enquiry_no}</TableCell>
                  <TableCell>{row.customer_name}</TableCell>
                  <TableCell>{row.customer_mobile}</TableCell>
                  <TableCell>{row.package_name}</TableCell>
                  <TableCell align="center">{row.pax_count}</TableCell>
                  <TableCell>
                    {renderPriorityChip(row.enquiry_priority)}
                  </TableCell>
                  <TableCell>
                    {renderStatusChip(row.conversion_status)}
                  </TableCell>
                  <TableCell>
                    {formatDate(row.created_at)}
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    {isTrash ? (
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => setActionUuid(row.uuid)}
                      >
                        <RestoreFromTrashIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      <RowActionsMenu
                        ariaLabel={t("common.actions")}
                        groups={[
                          ...getRowActionGroups(row),
                          [
                            {
                              key: "delete",
                              label: t("common.delete"),
                              icon: <DeleteIcon fontSize="small" />,
                              color: "error",
                              onClick: () => setActionUuid(row.uuid),
                            },
                          ],
                        ]}
                      />
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
        onRowsPerPageChange={(e) =>
          onPageSizeChange(parseInt(e.target.value, 10))
        }
      />
      <ConfirmDialog
        open={Boolean(actionUuid)}
        title={isTrash ? t("common.restore") : t("common.delete")}
        message={
          isTrash
            ? t("common.restoreConfirmMessage")
            : t("common.deleteConfirmMessageShort")
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

      <ConfirmDialog
        open={Boolean(cloneUuid)}
        title={t("enquiry.actionClone")}
        message={t("enquiry.cloneConfirmMessage")}
        confirmText={t("enquiry.actionClone")}
        loading={cloneLoading}
        onClose={() => setCloneUuid(null)}
        onConfirm={handleCloneConfirm}
      />

      <ConfirmDialog
        open={Boolean(reopenUuid)}
        title={t("enquiry.actionReopen")}
        message={t("enquiry.reopenConfirmMessage")}
        confirmText={t("enquiry.actionReopen")}
        loading={reopenLoading}
        onClose={() => setReopenUuid(null)}
        onConfirm={handleReopenConfirm}
      />

      <Dialog open={Boolean(markLostUuid)} onClose={() => setMarkLostUuid(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t("enquiry.actionMarkLost")}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth multiline minRows={2} sx={{ mt: 1 }}
            label={t("enquiry.markLostReason")}
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkLostUuid(null)}>{t("common.cancel")}</Button>
          <Button color="error" variant="contained" disabled={markLostLoading} onClick={handleMarkLostConfirm}>
            {t("enquiry.actionMarkLost")}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(assignUuid)} onClose={() => setAssignUuid(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t("enquiry.assignSalesExecutiveAndBranch")}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <EntityAutocomplete
              name="agent_uuid"
              label={t("booking.salesExecutive")}
              dropdownName="users"
              useForm={false}
              value={assignAgentUuid}
              onChange={(val) => setAssignAgentUuid(val)}
            />
            <EntityAutocomplete
              name="branch_uuid"
              label={t("enquiry.branch")}
              dropdownName="branch"
              useForm={false}
              value={assignBranchUuid}
              onChange={(val) => setAssignBranchUuid(val)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignUuid(null)}>{t("common.cancel")}</Button>
          <Button
            variant="contained"
            disabled={assignLoading || !assignAgentUuid || !assignBranchUuid}
            onClick={handleAssignConfirm}
          >
            {t("enquiry.assignSalesExecutiveAndBranch")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
