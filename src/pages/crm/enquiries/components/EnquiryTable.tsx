import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
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
  Button
} from '@mui/material';

import { alpha } from '@mui/material/styles';

import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InboxIcon from '@mui/icons-material/Inbox';

import { enquiryColumns } from '../enquiry.columns';
import { MOCK_ENQUIRIES } from '../mock';

/* ---------------- UTILS & FORMATTERS ---------------- */

const getStatusChipProps = (status: string) => {
  const map: Record<string, { color: string; bg: string }> = {
    Hot: { color: '#b71c1c', bg: '#ffebee' },
    Warm: { color: '#e65100', bg: '#fff3e0' },
    Cold: { color: '#1b5e20', bg: '#e8f5e9' },
    Converted: { color: '#1b5e20', bg: '#e8f5e9' },
    Pending: { color: '#e65100', bg: '#fff3e0' },
    Lost: { color: '#4a148c', bg: '#f3e5f5' },
  };

  const cfg = map[status];
  return {
    sx: {
      backgroundColor: cfg?.bg || '#f5f5f5',
      color: cfg?.color || '#000',
      fontWeight: 700,
      fontSize: '0.65rem',
      height: 20,
      borderRadius: '4px',
      textTransform: 'uppercase'
    },
  };
};

const formatCurrency = (amount: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

/* ---------------- COMPONENT ---------------- */

export default function EnquiryTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedTab, setSelectedTab] = useState<'All' | 'Hot' | 'Warm' | 'Cold'>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Delete State
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  /* ---------------- LOGIC ---------------- */

  const filteredData = useMemo(() => {
    let data = MOCK_ENQUIRIES;
    if (selectedTab !== 'All') data = data.filter((d) => d.status === selectedTab);
    if (search) {
      const s = search.toLowerCase();
      data = data.filter(d => 
        d.customer_name.toLowerCase().includes(s) || 
        d.package_name.toLowerCase().includes(s) ||
        d.agent_name.toLowerCase().includes(s)
      );
    }
    return data;
  }, [selectedTab, search]);

  const paginatedData = useMemo(() => {
    return filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const handleDeleteConfirm = () => {
    console.log('Deleting ID:', deleteId);
    setDeleteId(null);
    // Add your API call here
  };

  /* ---------------- MOBILE VIEW ---------------- */

  if (isMobile) {
    return (
      <Box sx={{ px: 1 }}>
        {isLoading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 2 }} />)
        ) : (
          paginatedData.map((row) => (
            <Card key={row.id} sx={{ mb: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider' }} elevation={0}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography fontWeight={700} variant="subtitle1">{row.customer_name}</Typography>
                  <Chip label={row.status} size="small" {...getStatusChipProps(row.status)} />
                </Box>
                <Typography variant="body2" color="text.secondary">{row.package_name}</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2" color="primary.main" fontWeight={700}>
                    {formatCurrency(row.quote_amount, row.currency_code)}
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={(_, v) => setPage(v)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>
    );
  }

  /* ---------------- DESKTOP TABLE ---------------- */

  return (
    <>
      <Tabs 
        value={selectedTab} 
        onChange={(_, v) => { setSelectedTab(v); setPage(0); }} 
        sx={{ mb: 3, '& .MuiTab-root': { fontWeight: 600 } }}
      >
        {['All', 'Hot', 'Warm', 'Cold'].map(label => <Tab key={label} value={label} label={label} />)}
      </Tabs>

      <TextField
        fullWidth
        placeholder="Search by customer, package or agent..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        InputProps={{ 
          startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> 
        }}
        sx={{ mb: 3 }}
      />

      {/* <TableContainer sx={{ maxHeight: 'calc(00vh - 350px)', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}> */}
      <TableContainer 
        sx={{ 
          width: '100%',
          overflowX: 'auto', // Keeps horizontal scroll for small screens
          borderRadius: 1, 
          border: '1px solid', 
          borderColor: 'divider',
          bgcolor: 'background.paper',
          mb: 2 // Margin bottom to separate from pagination
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ bgcolor: 'grey.50' }}><Checkbox color="primary" /></TableCell>
              {enquiryColumns.map((col) => (
                <TableCell key={col.id} align={col.align} sx={{ bgcolor: 'grey.50', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  {col.label}
                </TableCell>
              ))}
              <TableCell align="right" sx={{ bgcolor: 'grey.50', fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={12}><Skeleton variant="text" height={40} /></TableCell>
                </TableRow>
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <TableRow key={row.id} hover sx={{ '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) } }}>
                  <TableCell padding="checkbox"><Checkbox color="primary" /></TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>#{row.id}</TableCell>
                  <TableCell><Typography variant="body2" fontWeight={600}>{row.customer_name}</Typography></TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{row.package_name}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.85rem' }}>{row.pax_count}</TableCell>
                  <TableCell><Chip label={row.status} size="small" {...getStatusChipProps(row.status)} /></TableCell>
                  <TableCell><Chip label={row.conversion_status} size="small" {...getStatusChipProps(row.conversion_status)} /></TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {formatCurrency(row.quote_amount, row.currency_code)}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.85rem' }}>{row.agent_name}</TableCell>
                  <TableCell sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{formatDate(row.created_at)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Edit Enquiry" arrow>
                        <IconButton size="small" color="primary"><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Enquiry" arrow>
                        <IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={12} align="center" sx={{ py: 12 }}>
                  <Box sx={{ opacity: 0.5 }}>
                    <InboxIcon sx={{ fontSize: 64, mb: 2 }} />
                    <Typography variant="h6">No Enquiries Found</Typography>
                    <Typography variant="body2">Try adjusting your filters or search keywords.</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, v) => setPage(v)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 1 }}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete enquiry <strong>#{deleteId}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button onClick={() => setDeleteId(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}