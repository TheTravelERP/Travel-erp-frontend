// src/features/settings/users/pages/UserCreatePage.tsx
import { Box, Breadcrumbs, Link, Paper, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import UserForm from '../components/UserForm';
import { createUser } from '../users.api';
import { useSnackbar } from '../../../../components/ui/SnackbarProvider';

export default function UserCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  async function handleCreate(data: any) {
    try {
      const cleaned = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === '' ? undefined : v]),
      );
      await createUser(cleaned as any);
      showSnackbar({
        message: t('settings.userCreatedAssignPermissions'),
        severity: 'success',
      });
      navigate('/app/settings/users');
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail ?? t('common.createFailed'),
        severity: 'error',
      });
    }
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h6" fontWeight={700}>
        {t('common.add')}
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/app/dashboard" underline="hover">
          {t('menu.dashboard')}
        </Link>
        <Link component={RouterLink} to="/app/settings/users" underline="hover">
          {t('menu.settings.users')}
        </Link>
        <Typography color="text.primary">{t('common.add')}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <UserForm mode="create" onSubmit={handleCreate} />
      </Paper>
    </Box>
  );
}
