// src/features/settings/role/pages/RolePermissionsPage.tsx
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
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
  Chip,
} from '@mui/material';

import { getRoleByUuid } from '../role.api';
import {
  fetchRolePermissions,
  updateRolePermissions,
} from '../role.api';
import type { MenuPermissionNode, DataScope, RoleDetail } from '../role.types';
import { useSnackbar } from '../../../../components/ui/SnackbarProvider';
import { getErrorMessage } from '../../../../utils/errorMessage';

const ACTIONS: { key: keyof MenuPermissionNode; label: string }[] = [
  { key: 'can_view', label: 'View' },
  { key: 'can_add', label: 'Add' },
  { key: 'can_edit', label: 'Edit' },
  { key: 'can_delete', label: 'Delete' },
  { key: 'can_export', label: 'Export' },
  { key: 'can_import', label: 'Import' },
];

const DATA_SCOPES: DataScope[] = ['OWN', 'TEAM', 'ORG', 'GLOBAL'];

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

export default function RolePermissionsPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const [role, setRole] = useState<RoleDetail | null>(null);
  const [rows, setRows] = useState<MenuPermissionNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!uuid) return;
    const controller = new AbortController();

    Promise.all([getRoleByUuid(uuid), fetchRolePermissions(uuid, controller.signal)])
      .then(([roleData, permsData]) => {
        setRole(roleData);
        setRows(permsData.permissions);
      })
      .catch((err) => {
        if (!axios.isCancel(err)) {
          showSnackbar({ message: getErrorMessage(err, t('common.loadFailed')), severity: 'error' });
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  const orderedRows = useMemo(() => sortDepthFirst(rows), [rows]);

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

  const handleSave = async () => {
    if (!uuid) return;
    setSaving(true);
    try {
      const res = await updateRolePermissions(
        uuid,
        rows.map((r) => ({
          menu_id: r.menu_id,
          can_view: r.can_view,
          can_add: r.can_add,
          can_edit: r.can_edit,
          can_delete: r.can_delete,
          can_export: r.can_export,
          can_import: r.can_import,
          data_scope: r.data_scope,
        }))
      );
      setRows(res.permissions);
      showSnackbar({ message: t('common.updatedSuccess'), severity: 'success' });
    } catch (err: any) {
      showSnackbar({
        message: getErrorMessage(err, t('common.updateFailed')),
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h6" fontWeight={700}>
        {t('role.permissions')}
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/app/dashboard" underline="hover">
          {t('menu.dashboard')}
        </Link>
        <Link component={RouterLink} to="/app/settings/roles" underline="hover">
          {t('menu.settings.permissions')}
        </Link>
        <Typography color="text.primary">{t('role.permissions')}</Typography>
      </Breadcrumbs>

      {role && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>{role.role_name}</Typography>
          {role.is_system && <Chip size="small" label={t('role.system')} />}
        </Box>
      )}

      <Paper sx={{ overflow: 'auto', width: '100%' }}>
        {loading ? (
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
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                    <Typography variant="body2" fontWeight={600}>{t('role.colMenu')}</Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">{t('role.colAll')}</TableCell>
                {ACTIONS.map((a) => (
                  <TableCell key={a.key} align="center">{a.label}</TableCell>
                ))}
                <TableCell align="center">{t('role.colDataScope')}</TableCell>
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
                      onChange={(e) => toggleRowAll(node.menu_id, e.target.checked)}
                    />
                  </TableCell>
                  {ACTIONS.map((a) => (
                    <TableCell key={a.key} align="center">
                      <Checkbox
                        size="small"
                        checked={!!node[a.key]}
                        onChange={() => toggle(node.menu_id, a.key)}
                      />
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    <TextField
                      select
                      size="small"
                      value={node.data_scope}
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

      {!loading && (
        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/app/settings/roles')}>
            {t('common.back')}
          </Button>
          <Button variant="contained" disabled={saving} onClick={handleSave}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </Box>
      )}
    </Box>
  );
}
