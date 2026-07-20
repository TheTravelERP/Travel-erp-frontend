// src/features/settings/users/pages/UserEditPage.tsx
import { useEffect, useState } from 'react';
import { Box, Breadcrumbs, CircularProgress, Link, Paper, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import UserForm from '../components/UserForm';
import { getUserById, updateUser } from '../users.api';
import type { UserDetail } from '../users.types';
import { useSnackbar } from '../../../../components/ui/SnackbarProvider';

export default function UserEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getUserById(Number(id))
      .then(setUser)
      .catch(() => {
        showSnackbar({ message: t('common.loadFailed'), severity: 'error' });
        navigate('/app/settings/users');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleUpdate(data: any) {
    if (!user) return;
    try {
      const cleaned = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === '' ? undefined : v]),
      );
      await updateUser(user.id, { ...cleaned, version_no: user.version_no } as any);
      showSnackbar({ message: t('common.updatedSuccess'), severity: 'success' });
      navigate('/app/settings/users');
    } catch (err: any) {
      if (err?.response?.status === 409) {
        showSnackbar({
          message: t('common.updateConflict'),
          severity: 'error',
        });
        return;
      }
      showSnackbar({
        message: err?.response?.data?.detail ?? t('common.updateFailed'),
        severity: 'error',
      });
    }
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h6" fontWeight={700}>
        {t('common.edit')}
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/app/dashboard" underline="hover">
          {t('menu.dashboard')}
        </Link>
        <Link component={RouterLink} to="/app/settings/users" underline="hover">
          {t('menu.settings.users')}
        </Link>
        <Typography color="text.primary">{t('common.edit')}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {loading || !user ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <UserForm
            mode="edit"
            defaultValues={{
              name: user.name ?? '',
              email: user.email,
              mobile: user.mobile,
              user_type: user.user_type,
              status: user.status,
              dob: user.dob ?? '',
              gender: user.gender ?? '',
              marital_status: user.marital_status ?? '',
              anniversary_date: user.anniversary_date ?? '',
              blood_group: user.blood_group ?? '',
              designation: user.designation ?? '',
              date_of_joining: user.date_of_joining ?? '',
              picture_url: user.picture_url ?? '',
              emergency_contact_name: user.emergency_contact_name ?? '',
              emergency_contact_number: user.emergency_contact_number ?? '',
              identification_type: user.identification_type ?? '',
              identification_number: user.identification_number ?? '',
              identification_file_url: user.identification_file_url ?? '',
            }}
            onSubmit={handleUpdate}
          />
        )}
      </Paper>
    </Box>
  );
}
