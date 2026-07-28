// src/features/settings/communicationProviders/components/CommunicationProviderTable.tsx

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import InboxIcon from "@mui/icons-material/Inbox";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SendIcon from "@mui/icons-material/Send";

import type { CommunicationProviderListItem } from "../communicationProvider.types";
import ConfirmDialog from "../../../../components/common/ConfirmDialog";
import SortableTableCell from "../../../../components/common/SortableTableCell";
import {
  bulkDeleteCommunicationProviders,
  bulkRestoreCommunicationProviders,
  deleteCommunicationProviderByUuid,
  restoreCommunicationProviderByUuid,
  setDefaultCommunicationProvider,
  testCommunicationProvider,
} from "../communicationProvider.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

interface Props {
  rows: CommunicationProviderListItem[];
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
    { id: "provider_name", label: t("communicationProvider.colName"), sortable: true, minWidth: 180 },
    { id: "provider_category", label: t("communicationProvider.colCategory"), sortable: true, minWidth: 120 },
    { id: "provider_type", label: t("communicationProvider.colType"), sortable: true, minWidth: 140 },
    { id: "is_default", label: t("communicationProvider.colDefault"), minWidth: 100 },
    { id: "is_active", label: t("communicationProvider.colStatus"), minWidth: 100 },
  ];
}

function TestConnectionDialog({
  open,
  category,
  onClose,
  onTest,
}: {
  open: boolean;
  category?: string;
  onClose: () => void;
  onTest: (recipient: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [recipient, setRecipient] = useState("");
  const [loading, setLoading] = useState(false);
  const requiresRecipient = category !== "EMAIL";

  useEffect(() => {
    if (open) setRecipient("");
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("communicationProvider.testConnection")}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          sx={{ mt: 1 }}
          label={
            category === "EMAIL"
              ? t("communicationProvider.testRecipientEmailOptional")
              : t("communicationProvider.testRecipientRequired")
          }
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button
          variant="contained"
          disabled={loading || (requiresRecipient && !recipient)}
          onClick={async () => {
            setLoading(true);
            try {
              await onTest(recipient);
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? t("common.saving") : t("communicationProvider.sendTest")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function CommunicationProviderTable({
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
  const [testTarget, setTestTarget] = useState<CommunicationProviderListItem | null>(null);

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
        ? await bulkRestoreCommunicationProviders(uuids)
        : await bulkDeleteCommunicationProviders(uuids);
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
        await restoreCommunicationProviderByUuid(actionUuid);
        showSnackbar({ message: t("common.restoredSuccess"), severity: "success" });
      } else {
        await deleteCommunicationProviderByUuid(actionUuid);
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

  async function handleSetDefault(uuid: string) {
    try {
      await setDefaultCommunicationProvider(uuid);
      showSnackbar({ message: t("communicationProvider.setDefaultSuccess"), severity: "success" });
      onRefresh();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    }
  }

  async function handleTest(recipient: string) {
    if (!testTarget) return;
    try {
      const result = await testCommunicationProvider(testTarget.uuid, recipient || undefined);
      showSnackbar({ message: result.message, severity: result.success ? "success" : "error" });
      if (result.success) setTestTarget(null);
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("communicationProvider.testFailed")), severity: "error" });
    }
  }

  const categoryLabel = (category: string) =>
    category === "EMAIL"
      ? t("communicationProvider.categoryEmail")
      : category === "WHATSAPP"
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

  const rowActions = (row: CommunicationProviderListItem) => (
    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
      {!isTrash && (
        <>
          {!row.is_default && (
            <Tooltip title={t("communicationProvider.setDefault")}>
              <IconButton size="small" onClick={() => handleSetDefault(row.uuid)}>
                <StarBorderIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={t("communicationProvider.testConnection")}>
            <IconButton size="small" onClick={() => setTestTarget(row)}>
              <SendIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={() => navigate(`/app/settings/communication-settings/${row.uuid}/edit`)}>
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
                    <Typography fontWeight={600}>{row.provider_name}</Typography>
                    {row.is_default && <StarIcon fontSize="small" color="warning" />}
                  </Stack>
                  <Chip size="small" label={row.is_active ? t("common.active") : t("common.inactive")} color={row.is_active ? "success" : "default"} />
                </Stack>
                <Typography variant="caption">
                  {categoryLabel(row.provider_category)} &bull; {row.provider_type}
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
        <TestConnectionDialog
          open={Boolean(testTarget)}
          category={testTarget?.provider_category}
          onClose={() => setTestTarget(null)}
          onTest={handleTest}
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
                  <TableCell>{row.provider_name}</TableCell>
                  <TableCell>{categoryLabel(row.provider_category)}</TableCell>
                  <TableCell>{row.provider_type}</TableCell>
                  <TableCell>
                    {row.is_default ? (
                      <Chip size="small" icon={<StarIcon />} label={t("communicationProvider.default")} color="warning" />
                    ) : (
                      "—"
                    )}
                  </TableCell>
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
