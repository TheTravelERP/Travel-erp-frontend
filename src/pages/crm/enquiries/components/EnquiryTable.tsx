import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  IconButton,
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
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InboxIcon from '@mui/icons-material/Inbox';

import { enquiryColumns } from '../enquiry.columns';
import { MOCK_ENQUIRIES } from '../mock';
import { SearchInput } from '../../../../components/ui/SearchInput';
import { STATUS_COLOR_MAP } from './statusChip';
import { CONVERSION_STATUS_COLOR_MAP } from './conversionStatusChip';


/* ---------------- UTILS ---------------- */

const getStatusChipSx = (theme: any, status: string) => {
  const map: Record<string, { color: string; bg: string }> = {
    Hot: { color: theme.palette.error.dark, bg: theme.palette.error.light },
    Warm: { color: theme.palette.warning.dark, bg: theme.palette.warning.light },
    Cold: { color: theme.palette.success.dark, bg: theme.palette.success.light },
    Converted: { color: theme.palette.success.dark, bg: theme.palette.success.light },
    Pending: { color: theme.palette.warning.dark, bg: theme.palette.warning.light },
    Lost: { color: theme.palette.secondary.dark, bg: theme.palette.secondary.light },
  };

  const cfg = map[status];

  return {
    backgroundColor: cfg?.bg,
    color: cfg?.color,
    fontSize: '0.65rem',
    height: 20,
    textTransform: 'uppercase',
  };
};

const formatCurrency = (amount: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

/* ---------------- COMPONENT ---------------- */

export default function EnquiryTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedTab, setSelectedTab] =
    useState<'All' | 'Hot' | 'Warm' | 'Cold'>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  /* ---------------- DATA ---------------- */

  const filteredData = useMemo(() => {
    let data = MOCK_ENQUIRIES;

    if (selectedTab !== 'All') {
      data = data.filter((d) => d.status === selectedTab);
    }

    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (d) =>
          d.customer_name.toLowerCase().includes(s) ||
          d.package_name.toLowerCase().includes(s) ||
          d.agent_name.toLowerCase().includes(s)
      );
    }

    return data;
  }, [selectedTab, search]);

  const paginatedData = useMemo(
    () => filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredData, page, rowsPerPage]
  );

  const handleDeleteConfirm = () => {
    console.log('Deleting enquiry:', deleteId);
    setDeleteId(null);
  };

  /* ---------------- MOBILE VIEW ---------------- */

  if (isMobile) {
    return (
      <Box px={1}>
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={120} sx={{ mb: 2 }} />
          ))
        ) : (
          paginatedData.map((row) => (
            <Paper key={row.id} sx={{ mb: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle1">
                    {row.customer_name}
                  </Typography>
                  <Chip
                    label={row.status}
                    size="small"
                    sx={getStatusChipSx(theme, row.status)}
                  />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  {row.package_name}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2" color="primary">
                    {formatCurrency(row.quote_amount, row.currency_code)}
                  </Typography>

                  <Stack direction="row" spacing={0.5}>
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
                  </Stack>
                </Stack>
              </CardContent>
            </Paper>
          ))
        )}

        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={(_, v) => setPage(v)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>
    );
  }

  /* ---------------- DESKTOP VIEW ---------------- */

  return (
    <>
      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onChange={(_, v) => {
          setSelectedTab(v);
          setPage(0);
        }}
        sx={{ mb: 2 }}
      >
        {['All', 'Hot', 'Warm', 'Cold'].map((label) => (
          <Tab key={label} value={label} label={label} />
        ))}
      </Tabs>

      {/* Search */}
      <SearchInput
        placeholder="Search by customer, package or agent..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
        sx={{ mb: 3 }}
      />

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                {enquiryColumns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align}
                    sx={{
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      color: 'text.secondary',
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={12}>
                      <Skeleton height={40} />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginatedData.length ? (
                paginatedData.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox />
                    </TableCell>
                    <TableCell>#{row.id}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {row.customer_name}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.package_name}</TableCell>
                    <TableCell align="center">{row.pax_count}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.status}
                        size="small"
                        color={STATUS_COLOR_MAP[row.status] ?? 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.conversion_status}
                        size="small"
                        color={CONVERSION_STATUS_COLOR_MAP[row.conversion_status]}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(row.quote_amount, row.currency_code)}
                    </TableCell>
                    <TableCell>{row.agent_name}</TableCell>
                    <TableCell>{formatDate(row.created_at)}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteId(row.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 10 }}>
                    <InboxIcon sx={{ fontSize: 56, opacity: 0.4 }} />
                    <Typography variant="h6">No Enquiries Found</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your filters or search keywords.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, v) => setPage(v)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />

      {/* Delete Dialog */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete enquiry <strong>#{deleteId}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
