// src/features/enquiry/components/EnquiryTable.tsx

import { useState } from "react";
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
  Chip,
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
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InboxIcon from "@mui/icons-material/Inbox";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";
import type { EnquiryListItem } from "../enquiry.types";
import { formatDate } from "../../../utils/formatters/date";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { deleteEnquiryByUuid, restoreEnquiryByUuid } from "../enquiry.api";
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

const STATUS_COLORS = {
  Pending: "warning",
  FollowUp: "info",
  Converted: "success",
  Lost: "error",
  Cancelled: "default",
} as const;

const PRIORITY_COLORS = {
  Low: "success",
  Medium: "info",
  High: "warning",
  Urgent: "error",
} as const;

function renderStatusChip(status: string) {
  return <Chip size="small" label={status} />;
}

function renderPriorityChip(priority: string) {
  return <Chip size="small" label={priority} />;
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
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const { showSnackbar } = useSnackbar();
  const [deleteLoading, setDeleteLoading] = useState(false);

  // FUnctions

  async function handleDelete() {
    if (!deleteUuid) return;

    try {
      setDeleteLoading(true);

      await deleteEnquiryByUuid(deleteUuid);

      showSnackbar({
        message: "Enquiry deleted successfully",
        severity: "success",
      });

      //window.location.reload();
      onPageChange(page);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail ?? "Failed to delete enquiry",
        severity: "error",
      });
    } finally {
      setDeleteLoading(false);
      setDeleteUuid(null);
    }
  }

  /* ---------- MOBILE ---------- */
  if (isMobile) {
    return (
      <Box>
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} height={120} sx={{ mb: 2 }} />
          ))
        ) : rows.length ? (
          rows.map((row) => (
            <Paper key={row.id} sx={{ mb: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight={600}>{row.customer_name}</Typography>
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
          open={Boolean(deleteUuid)}
          title="Delete Enquiry"
          message="Are you sure you want to delete this enquiry?"
          confirmText="Delete"
          loading={deleteLoading}
          onClose={() => setDeleteUuid(null)}
          onConfirm={handleDelete}
        />
      </Box>
    );
  }

  /* ---------- DESKTOP ---------- */
  return (
    <>
      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
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
                <TableRow key={row.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox />
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
                          onClick={() => setDeleteUuid(row.uuid)}
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
                        onClick={async () => await restoreEnquiryByUuid(row.uuid)}
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
        open={Boolean(deleteUuid)}
        title={isTrash ? "Restore Enquiry" : "Delete Enquiry"}
        message={isTrash ? "Restore this enquiry?" : "Delete this enquiry?"}
        confirmText={isTrash ? "Restore" : "Delete"}
        loading={deleteLoading}
        onClose={() => setDeleteUuid(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
