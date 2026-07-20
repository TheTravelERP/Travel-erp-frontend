// src/features/settings/users/components/UsersTable.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Avatar,
  Chip,
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockPersonIcon from '@mui/icons-material/LockPerson';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import RestoreFromTrashIcon from '@mui/icons-material/RestoreFromTrash';

import type { UserListItem, UserStatus } from '../users.types';
import ConfirmDialog from '../../../../components/common/ConfirmDialog';
import SortableTableCell from '../../../../components/common/SortableTableCell';
import { resolveUploadUrl } from '../users.api';
import {
  bulkDeleteUsers,
  bulkRestoreUsers,
  deleteUser,
  restoreUser,
} from '../users.api';
import { useSnackbar } from '../../../../components/ui/SnackbarProvider';
import { useAuthContext } from '../../../../auth/context/AuthContext';

interface Props {
  rows: UserListItem[];
  loading: boolean;
  page: number;
  pageSize: number;
  total: number;
  isTrash: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (columnId: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRefresh: () => void;
}

const STATUS_COLOR: Record<UserStatus, 'success' | 'default' | 'error'> = {
  Active: 'success',
  Inactive: 'default',
  Suspended: 'error',
};

const COLUMNS: { id: string; label: string; align?: 'left' | 'center' | 'right' }[] = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'designation', label: 'Designation' },
  { id: 'user_type', label: 'Role' },
  { id: 'status', label: 'Status' },
];

export default function UsersTable({
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { session } = useAuthContext();
  const [actionId, setActionId] = useState<number | null>(null);
  const { showSnackbar } = useSnackbar();
  const [actionLoading, setActionLoading] = useState(false);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    setSelected(new Set());
  }, [rows, isTrash]);

  function toggleRow(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) => {
      const selectable = rows.filter((r) => r.id !== session?.user_id).map((r) => r.id);
      return prev.size === selectable.length ? new Set() : new Set(selectable);
    });
  }

  async function handleBulkConfirm() {
    const ids = Array.from(selected);
    if (!ids.length) return;

    try {
      setBulkLoading(true);
      const result = isTrash ? await bulkRestoreUsers(ids) : await bulkDeleteUsers(ids);
      showSnackbar({ message: result.message, severity: 'success' });
      setSelected(new Set());
      onRefresh();
    } catch (err: any) {
      showSnackbar({
        message:
          err?.response?.data?.detail ??
          (isTrash ? 'Failed to restore selected users' : 'Failed to delete selected users'),
        severity: 'error',
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
      sx={{ p: 1.5, mb: 1, borderRadius: 1, bgcolor: 'action.selected' }}
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
          color={isTrash ? 'success' : 'error'}
          startIcon={isTrash ? <RestoreFromTrashIcon fontSize="small" /> : <DeleteIcon fontSize="small" />}
          onClick={() => setBulkConfirmOpen(true)}
        >
          {isTrash ? 'Restore Selected' : 'Delete Selected'}
        </Button>
      </Stack>
    </Box>
  );

  async function handleConfirmAction() {
    if (actionId === null) return;

    try {
      setActionLoading(true);

      if (isTrash) {
        await restoreUser(actionId);
        showSnackbar({ message: 'User restored successfully', severity: 'success' });
      } else {
        await deleteUser(actionId);
        showSnackbar({ message: 'User deleted successfully', severity: 'success' });
      }

      onRefresh();
    } catch (err: any) {
      showSnackbar({
        message:
          err?.response?.data?.detail ??
          (isTrash ? 'Failed to restore user' : 'Failed to delete user'),
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
      setActionId(null);
    }
  }

  const rowActions = (row: UserListItem) => {
    const isSelf = row.id === session?.user_id;
    return (
      <>
        {!isTrash && (
          <>
            <IconButton size="small" onClick={() => navigate(`/app/settings/users/${row.id}/edit`)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => navigate(`/app/settings/permissions?userId=${row.id}`)}
              title="Manage permissions"
            >
              <LockPersonIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              disabled={isSelf}
              title={isSelf ? "You can't delete your own account" : undefined}
              onClick={() => setActionId(row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </>
        )}

        {isTrash && (
          <IconButton size="small" color="success" onClick={() => setActionId(row.id)}>
            <RestoreFromTrashIcon fontSize="small" />
          </IconButton>
        )}
      </>
    );
  };

  /* ---------- MOBILE ---------- */
  if (isMobile) {
    return (
      <Box>
        {selectionBar}

        {loading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} height={110} sx={{ mb: 2 }} />)
        ) : rows.length ? (
          rows.map((row) => (
            <Paper key={row.id} sx={{ mb: 1 }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {!isTrash && row.id !== session?.user_id && (
                      <Checkbox size="small" checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} />
                    )}
                    <Avatar src={resolveUploadUrl(row.picture_url)} sx={{ width: 32, height: 32 }} />
                    <Typography fontWeight={600}>{row.name || row.email}</Typography>
                  </Stack>
                  <Chip size="small" label={row.status} color={STATUS_COLOR[row.status]} />
                </Stack>

                <Typography variant="caption">{row.email} &bull; {row.mobile}</Typography>

                <Divider sx={{ my: 1 }} />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption">
                    {row.designation || row.user_type}
                  </Typography>
                  <Box>{rowActions(row)}</Box>
                </Stack>
              </CardContent>
            </Paper>
          ))
        ) : (
          <Box textAlign="center" py={5}>
            <PeopleOutlineIcon sx={{ fontSize: 48, opacity: 0.4 }} />
            <Typography>No Users Found</Typography>
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
        <ConfirmDialog
          open={actionId !== null}
          title={isTrash ? 'Restore User' : 'Delete User'}
          message={isTrash ? 'Restore this user?' : 'Are you sure you want to delete this user?'}
          confirmText={isTrash ? 'Restore' : 'Delete'}
          loading={actionLoading}
          onClose={() => setActionId(null)}
          onConfirm={handleConfirmAction}
        />
        <ConfirmDialog
          open={bulkConfirmOpen}
          title={isTrash ? 'Restore Users' : 'Delete Users'}
          message={
            isTrash ? `Restore ${selected.size} selected users?` : `Delete ${selected.size} selected users?`
          }
          confirmText={isTrash ? 'Restore' : 'Delete'}
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
                  indeterminate={selected.size > 0 && selected.size < rows.filter((r) => r.id !== session?.user_id).length}
                  checked={rows.length > 0 && selected.size === rows.filter((r) => r.id !== session?.user_id).length}
                  onChange={toggleSelectAll}
                  disabled={rows.length === 0}
                />
              </TableCell>
              {COLUMNS.map((col) => (
                <SortableTableCell
                  key={col.id}
                  id={col.id}
                  label={col.label}
                  align={col.align}
                  sortable
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={onSortChange}
                />
              ))}
              <TableCell align="center">Age</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading &&
              [...Array(pageSize)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={9}>
                    <Skeleton height={40} />
                  </TableCell>
                </TableRow>
              ))}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Box textAlign="center" py={5}>
                    <PeopleOutlineIcon sx={{ fontSize: 48, opacity: 0.4 }} />
                    <Typography>No Users Found</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              rows.map((row) => {
                const isSelf = row.id === session?.user_id;
                return (
                  <TableRow key={row.id} hover selected={selected.has(row.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.has(row.id)}
                        disabled={!isTrash && isSelf}
                        onChange={() => toggleRow(row.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar src={resolveUploadUrl(row.picture_url)} sx={{ width: 32, height: 32 }} />
                        <Typography variant="body2">{row.name || <em>&mdash;</em>}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.mobile}</TableCell>
                    <TableCell>{row.designation || '—'}</TableCell>
                    <TableCell>{row.user_type}</TableCell>
                    <TableCell>
                      <Chip size="small" label={row.status} color={STATUS_COLOR[row.status]} />
                    </TableCell>
                    <TableCell align="center">{row.age ?? '—'}</TableCell>
                    <TableCell align="right">{rowActions(row)}</TableCell>
                  </TableRow>
                );
              })}
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
      <ConfirmDialog
        open={actionId !== null}
        title={isTrash ? 'Restore User' : 'Delete User'}
        message={isTrash ? 'Restore this user?' : 'Delete this user?'}
        confirmText={isTrash ? 'Restore' : 'Delete'}
        loading={actionLoading}
        onClose={() => setActionId(null)}
        onConfirm={handleConfirmAction}
      />
      <ConfirmDialog
        open={bulkConfirmOpen}
        title={isTrash ? 'Restore Users' : 'Delete Users'}
        message={isTrash ? `Restore ${selected.size} selected users?` : `Delete ${selected.size} selected users?`}
        confirmText={isTrash ? 'Restore' : 'Delete'}
        loading={bulkLoading}
        onClose={() => setBulkConfirmOpen(false)}
        onConfirm={handleBulkConfirm}
      />
    </>
  );
}
