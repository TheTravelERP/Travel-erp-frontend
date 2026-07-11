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
import type { EnquiryListItem } from "../../../types/enquiry.types";
import { formatDate } from "../../../utils/formatters/date";

/* ================= TYPES ================= */

interface Props {
  rows: EnquiryListItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
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
    id: "agent_name",
    label: "Agent",
    sortable: true,
    minWidth: 160,
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
  onPageChange,
  onPageSizeChange,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<number | null>(null);

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
                  <TableCell>{row.agent_name}</TableCell>
                  <TableCell>
                    {new Date(row.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/app/enquiries/${row.id}`)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => navigate(`/app/enquiries/${row.id}/edit`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => setDeleteId(row.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
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
    </>
  );
}
