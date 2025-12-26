// src/pages/crm/enquiries/components/EnquiryTable.tsx

import React, { useState } from 'react';
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
  Card,
  CardContent,
  Typography,
  TablePagination,
  Divider,
  Tooltip,
  Stack,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Paper,
  IconButton,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InboxIcon from '@mui/icons-material/Inbox';

import type { EnquiryListItem } from '../../../../types/enquiry.types';
import { enquiryColumns } from '../enquiry.columns';
import { CONVERSION_STATUS_COLOR_MAP } from './conversionStatusChip';

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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  /* ---------- MOBILE ---------- */
  if (isMobile) {
    return (
      <Box>
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} height={120} sx={{ mb: 2 }} />
          ))
        ) : rows.length ? (
          rows.map(row => (
            <Paper key={row.id} sx={{ mb: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Typography fontWeight={600}>
                    {row.customer_name}
                  </Typography>
                  <Chip
                    size="small"
                    label={row.conversion_status}
                    color={CONVERSION_STATUS_COLOR_MAP[row.conversion_status]}
                  />
                </Stack>

                <Typography variant="caption">
                  {row.package_name}
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption">
                    Pax: {row.pax_count}
                  </Typography>
                  <Typography variant="caption">
                    {new Date(row.created_at).toLocaleDateString()}
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
              {enquiryColumns.map(col => (
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
              rows.map(row => (
                <TableRow key={row.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox />
                  </TableCell>
                  <TableCell>#{row.id}</TableCell>
                  <TableCell>{row.customer_name}</TableCell>
                  <TableCell>{row.customer_mobile}</TableCell>
                  <TableCell>{row.package_name}</TableCell>
                  <TableCell align="center">{row.pax_count}</TableCell>
                  <TableCell>{row.priority}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.conversion_status}
                      color={
                        CONVERSION_STATUS_COLOR_MAP[row.conversion_status]
                      }
                    />
                  </TableCell>
                  <TableCell>{row.agent_name}</TableCell>
                  <TableCell>
                    {new Date(row.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small">
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
