import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Breadcrumbs,
  Link,
  Paper,
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
  Avatar,
  Select,
  MenuItem,
  FormControl,
  Chip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
} from '@mui/material';

import { alpha } from '@mui/material/styles';   // ✅ FIXED

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';


// Mock Data
const MOCK_USERS = [
  { id: 1, name: 'Angelique Morse', email: 'benny89@hotmail.com', phone: '+46 8 123 456', company: 'Wuckert Inc', role: 'Content Creator', status: 'Banned', avatarUrl: 'https://placehold.co/100x100/556cd6/ffffff?text=AM' },
  { id: 2, name: 'Ariana Lang', email: 'avery43@hotmail.com', phone: '+54 11 1234 5678', company: 'Feest Group', role: 'IT Administrator', status: 'Pending', avatarUrl: 'https://placehold.co/100x100/1976d2/ffffff?text=AL' },
  { id: 3, name: 'Aspen Schmitt', email: 'mireya13@hotmail.com', phone: '+34 91 123 4567', company: 'Kihn, Marquardt and Crist', role: 'Financial Planner', status: 'Banned', avatarUrl: 'https://placehold.co/100x100/f50057/ffffff?text=AS' },
  { id: 4, name: 'Brandon Lee', email: 'brandon@example.com', phone: '+1 555 123 9876', company: 'Tech Solutions', role: 'Active User', status: 'Active', avatarUrl: 'https://placehold.co/100x100/00bcd4/ffffff?text=BL' },
  { id: 5, name: 'Chloe Davis', email: 'chloe@example.com', phone: '+44 20 7946 0987', company: 'Global Corp', role: 'Active User', status: 'Active', avatarUrl: 'https://placehold.co/100x100/4caf50/ffffff?text=CD' },
  { id: 6, name: 'Ethan Hunt', email: 'ethan@mission.com', phone: '+1 555 007 0077', company: 'IMF', role: 'Rejected Candidate', status: 'Rejected', avatarUrl: 'https://placehold.co/100x100/ff9800/ffffff?text=EH' },
];

// Helper function for status chip color/style
const getStatusChipProps = (status) => {
  let color, bgcolor;
  switch (status) {
    case 'Active':
      color = '#1b5e20'; // dark green
      bgcolor = '#e8f5e9'; // light green
      break;
    case 'Pending':
      color = '#e65100'; // dark orange
      bgcolor = '#fff3e0'; // light orange
      break;
    case 'Banned':
      color = '#b71c1c'; // dark red
      bgcolor = '#ffebee'; // light red
      break;
    case 'Rejected':
      color = '#4a148c'; // dark purple
      bgcolor = '#f3e5f5'; // light purple
      break;
    default:
      color = '#000000';
      bgcolor = '#eeeeee';
  }
  return { style: { backgroundColor: bgcolor, color: color, fontWeight: 600, fontSize: '0.7rem', padding: '2px 8px' } };
};

const headCells = [
  { id: 'name', label: 'Name', sortable: true, minWidth: 200 },
  { id: 'phone', label: 'Phone number', sortable: false, minWidth: 150 },
  { id: 'company', label: 'Company', sortable: false, minWidth: 200 },
  { id: 'role', label: 'Role', sortable: false, minWidth: 150 },
  { id: 'status', label: 'Status', sortable: true, minWidth: 100 },
  { id: 'actions', label: '', sortable: false, minWidth: 80 },
];

const UserList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedTab, setSelectedTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setSearchTerm('');
    setSelectedRole('All');
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = filteredUsers.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };

  const filteredUsers = useMemo(() => {
    const statusFiltered = MOCK_USERS.filter(user => 
      selectedTab === 'All' || user.status === selectedTab
    );
    
    const roleFiltered = statusFiltered.filter(user => 
      selectedRole === 'All' || user.role === selectedRole
    );

    const searchFiltered = roleFiltered.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return stableSort(searchFiltered, getComparator(order, orderBy));
  }, [selectedTab, searchTerm, selectedRole, order, orderBy]);

  const statusCounts = MOCK_USERS.reduce((acc, user) => {
    acc[user.status] = (acc[user.status] || 0) + 1;
    return acc;
  }, {});

  const isSelected = (id) => selected.indexOf(id) !== -1;
  const uniqueRoles = ['All', ...new Set(MOCK_USERS.map(user => user.role))];


  const renderTableContent = () => {
    if (isMobile) {
        // Mobile view: Render a simple list of cards
        return (
            <Box sx={{ mt: 2 }}>
                {filteredUsers.map((user) => (
                    <Card 
                        key={user.id} 
                        variant="outlined" 
                        sx={{ mb: 1.5, borderRadius: 2, borderColor: theme.palette.divider }}
                    >
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Checkbox 
                                    checked={isSelected(user.id)}
                                    onChange={(event) => handleClick(event, user.id)}
                                    size="small"
                                    sx={{ p: 0, mr: 1 }}
                                />
                                <Avatar 
                                    src={user.avatarUrl} 
                                    sx={{ width: 40, height: 40, mr: 1.5 }}
                                />
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="600" lineHeight={1}>
                                        {user.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {user.email}
                                    </Typography>
                                </Box>
                                <Box sx={{ ml: 'auto' }}>
                                    <IconButton size="small">
                                        <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mt: 1, borderTop: `1px dashed ${theme.palette.divider}`, pt: 1 }}>
                                <Box>
                                    <Typography variant="overline" color="text.disabled">Role</Typography>
                                    <Typography variant="body2">{user.role}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="overline" color="text.disabled">Status</Typography>
                                    <Chip 
                                        label={user.status} 
                                        size="small" 
                                        {...getStatusChipProps(user.status)} 
                                    />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        );
    }
    
    // Desktop view: Render Table
    return (
        <TableContainer sx={{ maxHeight: 600, overflowX: 'auto' }}>
            <Table stickyHeader size="medium">
                <TableHead>
                    <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                        <TableCell padding="checkbox">
                            <Checkbox
                                indeterminate={selected.length > 0 && selected.length < filteredUsers.length}
                                checked={filteredUsers.length > 0 && selected.length === filteredUsers.length}
                                onChange={handleSelectAllClick}
                            />
                        </TableCell>
                        {headCells.map((headCell) => (
                            <TableCell
                                key={headCell.id}
                                sx={{ minWidth: headCell.minWidth }}
                                sortDirection={orderBy === headCell.id ? order : false}
                            >
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        cursor: headCell.sortable ? 'pointer' : 'default',
                                        '&:hover .MuiSvgIcon-root': { opacity: 1 },
                                        fontWeight: 600
                                    }}
                                    onClick={() => headCell.sortable && handleRequestSort(headCell.id)}
                                >
                                    {headCell.label}
                                    {headCell.sortable && (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 0.5 }}>
                                            {orderBy === headCell.id ? (
                                                order === 'asc' ? <ArrowUpwardIcon sx={{ fontSize: 14 }} /> : <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                                            ) : (
                                                <ArrowUpwardIcon sx={{ fontSize: 14, opacity: 0 }} /> // Placeholder for alignment
                                            )}
                                        </Box>
                                    )}
                                </Box>
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredUsers.map((user) => {
                        const isItemSelected = isSelected(user.id);

                        return (
                            <TableRow
                                hover
                                role="checkbox"
                                tabIndex={-1}
                                key={user.id}
                                selected={isItemSelected}
                                sx={{
                                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                                    '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
                                }}
                            >
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={isItemSelected}
                                        onClick={(event) => handleClick(event, user.id)}
                                    />
                                </TableCell>

                                {/* Name & Email */}
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Avatar src={user.avatarUrl} sx={{ width: 32, height: 32, mr: 2 }} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={600}>{user.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>

                                {/* Phone number */}
                                <TableCell>{user.phone}</TableCell>

                                {/* Company */}
                                <TableCell>{user.company}</TableCell>

                                {/* Role */}
                                <TableCell>{user.role}</TableCell>

                                {/* Status */}
                                <TableCell>
                                    <Chip 
                                        label={user.status} 
                                        size="small" 
                                        {...getStatusChipProps(user.status)} 
                                    />
                                </TableCell>

                                {/* Actions */}
                                <TableCell padding="none">
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton size="small" aria-label="edit">
                                            <EditIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                        <IconButton size="small" aria-label="delete">
                                            <DeleteIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {filteredUsers.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={headCells.length + 1} align="center" sx={{ py: 4 }}>
                                <Typography variant="subtitle1" color="text.secondary">No users found.</Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 2 : 4, bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      
      {/* Header and Breadcrumbs */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>List</Typography>
          <Breadcrumbs separator="•" sx={{ mt: 0.5 }}>
            <Link underline="hover" color="inherit" href="/app/dashboard" sx={{ fontSize: '0.875rem' }}>Dashboard</Link>
            <Link underline="hover" color="inherit" href="/app/users" sx={{ fontSize: '0.875rem' }}>User</Link>
            <Typography color="text.primary" sx={{ fontSize: '0.875rem' }}>List</Typography>
          </Breadcrumbs>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            bgcolor: theme.palette.primary.main,
            color: 'white',
            fontWeight: 600,
            borderRadius: 1,
            boxShadow: theme.shadows[3],
            '&:hover': { bgcolor: theme.palette.primary.dark },
          }}
        >
          {isMobile ? 'Add' : 'Add user'}
        </Button>
      </Box>

      {/* Main Content Card */}
      <Paper elevation={4} sx={{ p: isMobile ? 1.5 : 3, borderRadius: 2 }}>
        
        {/* Tabs */}
        <Tabs 
            value={selectedTab} 
            onChange={handleTabChange} 
            aria-label="User Status Tabs"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons="auto"
            sx={{ mb: 3 }}
        >
          <Tab value="All" label={<>All <Chip label={MOCK_USERS.length} size="small" sx={{ ml: 1, height: 20 }} /></>} />
          <Tab value="Active" label={<>Active <Chip label={statusCounts.Active || 0} size="small" color="success" sx={{ ml: 1, height: 20 }} /></>} />
          <Tab value="Pending" label={<>Pending <Chip label={statusCounts.Pending || 0} size="small" color="warning" sx={{ ml: 1, height: 20 }} /></>} />
          <Tab value="Banned" label={<>Banned <Chip label={statusCounts.Banned || 0} size="small" color="error" sx={{ ml: 1, height: 20 }} /></>} />
          <Tab value="Rejected" label={<>Rejected <Chip label={statusCounts.Rejected || 0} size="small" color="secondary" sx={{ ml: 1, height: 20 }} /></>} />
        </Tabs>

        {/* Filter & Search Bar */}
        <Box 
            sx={{ 
                display: 'flex', 
                gap: 2, 
                mb: 3, 
                flexDirection: isMobile ? 'column' : 'row' 
            }}
        >
          <FormControl sx={{ minWidth: isMobile ? '100%' : 150 }}>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              displayEmpty
              inputProps={{ 'aria-label': 'Select Role' }}
              sx={{ borderRadius: 1.5 }}
            >
              {uniqueRoles.map((role) => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              sx: { borderRadius: 1.5 }
            }}
          />

          <IconButton size="large" sx={{ 
              borderRadius: 1.5, 
              border: `1px solid ${theme.palette.divider}`,
              minWidth: 50,
              height: '56px' // Match text field height
          }}>
            <MoreVertIcon />
          </IconButton>
        </Box>
        
        {/* Table/List View */}
        {renderTableContent()}
      
      </Paper>
    </Box>
  );
};

export default UserList;