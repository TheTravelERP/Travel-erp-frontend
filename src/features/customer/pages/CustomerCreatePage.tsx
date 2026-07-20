// src/features/customer/pages/CustomerCreatePage.tsx
import {
  Box,
  Breadcrumbs,
  Link,
  Paper,
  Typography,
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import CustomerForm from '../components/CustomerForm';
import type { CustomerFormValues } from '../components/CustomerForm';
import { createCustomer } from '../customer.api';
import { usePermission } from '../../../hooks/usePermission';
import { useSnackbar } from '../../../components/ui/SnackbarProvider';
import { Link as RouterLink } from 'react-router-dom';

export default function CustomerCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission('crm.customers');

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: CustomerFormValues) {
    try {
      const cleaned = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === '' ? undefined : v]),
      );
      await createCustomer(cleaned as CustomerFormValues);
      showSnackbar({ message: t('common.createdSuccess'), severity: 'success' });
      navigate('/app/crm/customers');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || t('common.createFailed');
      showSnackbar({ message: msg, severity: 'error' });
    }
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h6" fontWeight={700}>
        {t('common.create')}
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/app/dashboard" underline="hover">
          {t('menu.dashboard')}
        </Link>
        <Link component={RouterLink} to="/app/crm/customers" underline="hover">
          {t('menu.crm.customers')}
        </Link>
        <Typography color="text.primary">{t('common.create')}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <CustomerForm onSubmit={handleCreate} />
      </Paper>
    </Box>
  );
}
