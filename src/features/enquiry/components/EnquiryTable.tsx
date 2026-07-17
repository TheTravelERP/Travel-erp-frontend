// src/features/enquiry/components/EnquiryTable.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import type { EnquiryListItem } from "../enquiry.types";
import { formatDate } from "../../../utils/formatters/date";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import DropdownColorChip from "../../../components/common/DropdownColorChip";
import {
  bulkDeleteEnquiries,
  bulkRestoreEnquiries,
  deleteEnquiryByUuid,
  restoreEnquiryByUuid,
} from "../enquiry.api";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";

/* ================= TYPES ================= */

interface Props {
  rows: EnquiryListItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  isTrash: boolean;
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

const columns: TableColumn[] = [
  {
    id: "enquiry_no",
    label: "Enquiry No.",
    sortable: true,
    minWidth: 90,
  },
  {
    id: "customer_name",
    label: "Customer",
    sortable: true,
    minWidth: 200,
  },
  {
    id: "customer_mobile",
    label: "Mobile",
    sortable: true,
    minWidth: 200,
  },
  {
    id: "package_name",
    label: "Package",
    sortable: true,
    minWidth: 220,
  },
  {
    id: "pax_count",
    label: "PAX",
    sortable: true,
    align: "center",
    minWidth: 80,
  },
  {
    id: "enquiry_priority",
    label: "Priority",
    sortable: true,
    format: "chip",
    minWidth: 110,
  },
  {
    id: "conversion_status",
    label: "Conversion",
    sortable: true,
    format: "chip",
    minWidth: 120,
  },
  {
    id: "created_at",
    label: "Created On",
    sortable: true,
    format: "date",
    minWidth: 140,
  },
];

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
  onPageChange,
  onPageSizeChange,
  onRefresh,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const [actionUuid, setActionUuid] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();
  const [actionLoading, setActionLoading] = useState(false);

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
          (isTrash ? "Failed to restore selected enquiries" : "Failed to delete selected enquiries"),
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
        {selected.size} selected
      </Typography>

      <Stack direction="row" spacing={1}>
        <Button size="small" onClick={() => setSelected(new Set())}>
          Clear
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
          {isTrash ? "Restore Selected" : "Delete Selected"}
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
          message: "Enquiry restored successfully",
          severity: "success",
        });
      } else {
        await deleteEnquiryByUuid(actionUuid);
        showSnackbar({
          message: "Enquiry deleted successfully",
          severity: "success",
        });
      }

      // Refresh the current list/trash view
      onRefresh();
    } catch (err: any) {
      showSnackbar({
        message:
          err?.response?.data?.detail ??
          (isTrash ? "Failed to restore enquiry" : "Failed to delete enquiry"),
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
                    Pax: {row.pax_count}
                  </Typography>
                  <Typography variant="caption">
                    {formatDate(row.created_at)}
                  </Typography>
                </Stack>
              </CardContent>
            </Paper>
          ))
        ) : (
          <Box textAlign="center" py={5}>
            <InboxIcon sx={{ fontSize: 48, opacity: 0.4 }} />
            <Typography>No Enquiries Found</Typography>
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
          title={isTrash ? "Restore Enquiry" : "Delete Enquiry"}
          message={
            isTrash
              ? "Restore this enquiry?"
              : "Are you sure you want to delete this enquiry?"
          }
          confirmText={isTrash ? "Restore" : "Delete"}
          loading={actionLoading}
          onClose={() => setActionUuid(null)}
          onConfirm={handleConfirmAction}
        />
        <ConfirmDialog
          open={bulkConfirmOpen}
          title={isTrash ? "Restore Enquiries" : "Delete Enquiries"}
          message={
            isTrash
              ? `Restore ${selected.size} selected enquiries?`
              : `Delete ${selected.size} selected enquiries?`
          }
          confirmText={isTrash ? "Restore" : "Delete"}
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
                <TableCell key={col.id}>{col.label}</TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
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
                    {new Date(row.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    {/* View - always visible */}
                    <IconButton
                      size="small"
                      onClick={() =>
                        navigate(
                          isTrash
                            ? `/app/enquiries/${row.uuid}?is_deleted=true`
                            : `/app/enquiries/${row.uuid}`,
                        )
                      }
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>

                    {/* Active Enquiries */}
                    {!isTrash && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(`/app/enquiries/${row.uuid}/edit`)
                          }
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

                    {/* Trash */}
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
        onRowsPerPageChange={(e) =>
          onPageSizeChange(parseInt(e.target.value, 10))
        }
      />
      <ConfirmDialog
        open={Boolean(actionUuid)}
        title={isTrash ? "Restore Enquiry" : "Delete Enquiry"}
        message={isTrash ? "Restore this enquiry?" : "Delete this enquiry?"}
        confirmText={isTrash ? "Restore" : "Delete"}
        loading={actionLoading}
        onClose={() => setActionUuid(null)}
        onConfirm={handleConfirmAction}
      />
      <ConfirmDialog
        open={bulkConfirmOpen}
        title={isTrash ? "Restore Enquiries" : "Delete Enquiries"}
        message={
          isTrash
            ? `Restore ${selected.size} selected enquiries?`
            : `Delete ${selected.size} selected enquiries?`
        }
        confirmText={isTrash ? "Restore" : "Delete"}
        loading={bulkLoading}
        onClose={() => setBulkConfirmOpen(false)}
        onConfirm={handleBulkConfirm}
      />
    </>
  );
}
