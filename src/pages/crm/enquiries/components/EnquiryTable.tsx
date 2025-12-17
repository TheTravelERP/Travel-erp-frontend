import React, { useState, useMemo } from 'react';
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
  Pagination,
} from '@mui/material';

import { alpha } from '@mui/material/styles';

import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { enquiryColumns } from '../enquiry.columns';
import { MOCK_ENQUIRIES } from '../mock';

/* ---------------- HELPERS ---------------- */

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
    style: {
      backgroundColor: cfg?.bg,
      color: cfg?.color,
      fontWeight: 600,
      fontSize: '0.7rem',
      height: 22,
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
  new Date(date).toLocaleDateString('en-IN');

/* ---------------- COMPONENT ---------------- */

export default function EnquiryTable() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedTab, setSelectedTab] = useState<'All' | 'Hot' | 'Warm' | 'Cold'>('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const rowsPerPage = 10;

  /* ---------------- FILTERING ---------------- */

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
          d.package_name.toLowerCase().includes(s)
      );
    }

    return data;
  }, [selectedTab, search]);

  /* ---------------- PAGINATION ---------------- */

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page]);

  /* ---------------- MOBILE VIEW ---------------- */

  if (isMobile) {
    return (
      <Box>
        {paginatedData.map((row) => (
          <Card key={row.id} sx={{ mb: 1.5 }}>
            <CardContent>
              <Typography fontWeight={600}>{row.customer_name}</Typography>

              <Typography variant="caption" color="text.secondary">
                {row.package_name}
              </Typography>

              <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                <Chip label={row.status} size="small" {...getStatusChipProps(row.status)} />
                <Chip
                  label={row.conversion_status}
                  size="small"
                  {...getStatusChipProps(row.conversion_status)}
                />
              </Box>

              <Typography sx={{ mt: 1 }} variant="body2">
                Quote: {formatCurrency(row.quote_amount, row.currency_code)}
              </Typography>
            </CardContent>
          </Card>
        ))}

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Box>
      </Box>
    );
  }

  /* ---------------- DESKTOP TABLE ---------------- */

  return (
    <>
      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onChange={(_, v) => {
          setSelectedTab(v);
          setPage(1);
        }}
        sx={{ mb: 2 }}
      >
        <Tab value="All" label="All" />
        <Tab value="Hot" label="Hot" />
        <Tab value="Warm" label="Warm" />
        <Tab value="Cold" label="Cold" />
      </Tabs>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search customer or package..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>

              {enquiryColumns.map((col) => (
                <TableCell key={col.id} align={col.align}>
                  {col.label}
                </TableCell>
              ))}

              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.map((row) => (
              <TableRow
                key={row.id}
                hover
                sx={{
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  },
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox />
                </TableCell>

                <TableCell>{row.id}</TableCell>

                <TableCell>
                  <Typography fontWeight={600}>{row.customer_name}</Typography>
                </TableCell>

                <TableCell>{row.package_name}</TableCell>

                <TableCell align="center">{row.pax_count}</TableCell>

                <TableCell>
                  <Chip label={row.status} size="small" {...getStatusChipProps(row.status)} />
                </TableCell>

                <TableCell>
                  <Chip
                    label={row.conversion_status}
                    size="small"
                    {...getStatusChipProps(row.conversion_status)}
                  />
                </TableCell>

                <TableCell align="right">
                  {formatCurrency(row.quote_amount, row.currency_code)}
                </TableCell>

                <TableCell>{row.agent_name}</TableCell>

                <TableCell>{formatDate(row.created_at)}</TableCell>

                <TableCell align="right">
                  <IconButton size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {paginatedData.length === 0 && (
              <TableRow>
                <TableCell colSpan={enquiryColumns.length + 2} align="center">
                  <Typography color="text.secondary">No enquiries found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {(page - 1) * rowsPerPage + 1}–
            {Math.min(page * rowsPerPage, filteredData.length)} of{' '}
            {filteredData.length}
          </Typography>

          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </>
  );
}
