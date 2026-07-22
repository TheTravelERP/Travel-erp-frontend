// src/features/settings/pages/PermissionsPage.tsx
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  IconButton,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { fetchUsersLookup, type UserListItem } from '../../../services/user.service';
import {
  fetchUserPermissions,
  updateUserPermissions,
  type MenuPermissionNode,
  type DataScope,
} from '../../../services/permission.service';
import { useSnackbar } from '../../../components/ui/SnackbarProvider';
import { useAuthContext } from '../../../auth/context/AuthContext';

const ACTIONS: { key: keyof MenuPermissionNode; label: string }[] = [
  { key: 'can_view', label: 'View' },
  { key: 'can_create', label: 'Create' },
  { key: 'can_edit', label: 'Edit' },
  { key: 'can_delete', label: 'Delete' },
  { key: 'can_export', label: 'Export' },
  { key: 'can_import', label: 'Import' },
  { key: 'can_print', label: 'Print' },
  { key: 'can_approve', label: 'Approve' },
  { key: 'can_cancel', label: 'Cancel' },
  { key: 'can_reopen', label: 'Reopen' },
];

const DATA_SCOPES: DataScope[] = ['OWN', 'TEAM', 'ORG'];

interface DepthNode {
  node: MenuPermissionNode;
  depth: number;
}

function sortDepthFirst(nodes: MenuPermissionNode[]): DepthNode[] {
  const byParent = new Map<number | null, MenuPermissionNode[]>();
  for (const node of nodes) {
    const list = byParent.get(node.parent_id) ?? [];
    list.push(node);
    byParent.set(node.parent_id, list);
  }
  for (const list of byParent.values()) list.sort((a, b) => a.sort_order - b.sort_order);

  const result: DepthNode[] = [];
  const walk = (parentId: number | null, depth: number) => {
    for (const node of byParent.get(parentId) ?? []) {
      result.push({ node, depth });
      walk(node.menu_id, depth + 1);
    }
  };
  walk(null, 0);
  return result;
}

export default function PermissionsPage() {
  const { showSnackbar } = useSnackbar();
  const { session } = useAuthContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const [users, setUsers] = useState<UserListItem[]>([]);
  const [selectedUserUuid, setSelectedUserUuid] = useState<string>('');
  const [rows, setRows] = useState<MenuPermissionNode[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsersLookup()
      .then((list) => {
        setUsers(list);
        const fromQuery = searchParams.get('userUuid');
        if (fromQuery && list.some((u) => u.uuid === fromQuery)) {
          setSelectedUserUuid(fromQuery);
        }
      })
      .catch(() => showSnackbar({ message: 'Failed to load users', severity: 'error' }))
      .finally(() => setLoadingUsers(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedUserUuid) {
      setRows([]);
      return;
    }
    const controller = new AbortController();
    setLoadingPerms(true);
    fetchUserPermissions(selectedUserUuid, controller.signal)
      .then((res) => setRows(res.permissions))
      .catch((err) => {
        if (!axios.isCancel(err)) {
          showSnackbar({ message: 'Failed to load permissions', severity: 'error' });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingPerms(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserUuid]);

  const orderedRows = useMemo(() => sortDepthFirst(rows), [rows]);
  const selectedUser = users.find((u) => u.uuid === selectedUserUuid);
  const isSelf = !!selectedUser && selectedUser.id === session?.user_id;

  const toggle = (menuId: number, action: keyof MenuPermissionNode) => {
    setRows((prev) =>
      prev.map((r) => (r.menu_id === menuId ? { ...r, [action]: !r[action] } : r))
    );
  };

  const updateDataScope = (menuId: number, scope: DataScope) => {
    setRows((prev) =>
      prev.map((r) => (r.menu_id === menuId ? { ...r, data_scope: scope } : r))
    );
  };

  const isRowFullyChecked = (node: MenuPermissionNode) => ACTIONS.every((a) => !!node[a.key]);
  const isRowPartiallyChecked = (node: MenuPermissionNode) =>
    ACTIONS.some((a) => !!node[a.key]) && !isRowFullyChecked(node);

  const toggleRowAll = (menuId: number, checked: boolean) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.menu_id !== menuId) return r;
        const patch: Partial<MenuPermissionNode> = {};
        ACTIONS.forEach((a) => {
          (patch as any)[a.key] = checked;
        });
        return { ...r, ...patch };
      })
    );
  };

  const allFullyChecked = rows.length > 0 && rows.every(isRowFullyChecked);
  const allPartiallyChecked = !allFullyChecked && rows.some((r) => ACTIONS.some((a) => !!r[a.key]));

  const toggleAll = (checked: boolean) => {
    setRows((prev) =>
      prev.map((r) => {
        const patch: Partial<MenuPermissionNode> = {};
        ACTIONS.forEach((a) => {
          (patch as any)[a.key] = checked;
        });
        return { ...r, ...patch };
      })
    );
  };

  const handleUserChange = (value: string) => {
    setSelectedUserUuid(value);
    setSearchParams(value ? { userUuid: value } : {});
  };

  const handleSave = async () => {
    if (!selectedUserUuid) return;
    setSaving(true);
    try {
      const res = await updateUserPermissions(
        selectedUserUuid,
        rows.map((r) => ({
          menu_id: r.menu_id,
          can_view: r.can_view,
          can_create: r.can_create,
          can_edit: r.can_edit,
          can_delete: r.can_delete,
          can_export: r.can_export,
          can_import: r.can_import,
          can_print: r.can_print,
          can_approve: r.can_approve,
          can_cancel: r.can_cancel,
          can_reopen: r.can_reopen,
          data_scope: r.data_scope,
        }))
      );
      setRows(res.permissions);
      showSnackbar({ message: 'Permissions updated', severity: 'success' });
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail ?? 'Failed to update permissions',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Permissions
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Dashboard &bull; Settings &bull; Permissions
      </Typography>

      <Paper sx={{ p: 3, mb: 3, maxWidth: 360 }}>
        <TextField
          select
          fullWidth
          label="User"
          value={selectedUserUuid}
          disabled={loadingUsers}
          onChange={(e) => handleUserChange(e.target.value)}
        >
          {users.map((u) => (
            <MenuItem key={u.uuid} value={u.uuid}>
              {u.name || u.email} ({u.user_type})
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {isSelf && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You can't edit your own permissions — select a different user, or ask another admin.
        </Alert>
      )}

      {selectedUserUuid && (
        <Paper sx={{ overflow: 'auto', width: '100%' }}>
          {loadingPerms ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table size="small" sx={{ width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Checkbox
                        size="small"
                        checked={allFullyChecked}
                        indeterminate={allPartiallyChecked}
                        disabled={isSelf}
                        onChange={(e) => toggleAll(e.target.checked)}
                      />
                      <Typography variant="body2" fontWeight={600}>Menu</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">All</TableCell>
                  {ACTIONS.map((a) => (
                    <TableCell key={a.key} align="center">{a.label}</TableCell>
                  ))}
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.25 }}>
                      Data Scope
                      <Tooltip title={
                        <>
                          OWN — only records they created.<br />
                          TEAM — their own records plus their direct reports'.<br />
                          ORG — everything in the organization.<br />
                          (GLOBAL, cross-org access, will be reserved for a future Super Admin role.)
                        </>
                      }>
                        <IconButton size="small" sx={{ p: 0.25 }}>
                          <InfoOutlinedIcon fontSize="inherit" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orderedRows.map(({ node, depth }: { node: MenuPermissionNode; depth: number }) => (
                  <TableRow key={node.menu_id} hover>
                    <TableCell sx={{ pl: 2 + depth * 3 }}>{node.title}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        size="small"
                        checked={isRowFullyChecked(node)}
                        indeterminate={isRowPartiallyChecked(node)}
                        disabled={isSelf}
                        onChange={(e) => toggleRowAll(node.menu_id, e.target.checked)}
                      />
                    </TableCell>
                    {ACTIONS.map((a) => (
                      <TableCell key={a.key} align="center">
                        <Checkbox
                          size="small"
                          checked={!!node[a.key]}
                          disabled={isSelf}
                          onChange={() => toggle(node.menu_id, a.key)}
                        />
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <TextField
                        select
                        size="small"
                        value={node.data_scope}
                        disabled={isSelf}
                        onChange={(e) => updateDataScope(node.menu_id, e.target.value as DataScope)}
                        sx={{ minWidth: 100 }}
                      >
                        {DATA_SCOPES.map((s) => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      )}

      {selectedUserUuid && !loadingPerms && (
        <Box sx={{ mt: 3 }}>
          <Button variant="contained" disabled={saving || isSelf} onClick={handleSave}>
            {saving ? 'Saving...' : 'Save Permissions'}
          </Button>
        </Box>
      )}
    </Box>
  );
}
