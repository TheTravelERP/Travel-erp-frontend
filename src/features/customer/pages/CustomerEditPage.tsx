// src/features/customer/pages/CustomerEditPage.tsx
import { useEffect, useState } from 'react';
import { Box, Breadcrumbs, CircularProgress, Link, Paper, Typography } from '@mui/material';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import CustomerForm from '../components/CustomerForm';
import type { CustomerFormValues } from '../components/CustomerForm';
import { getCustomerByUuid, updateCustomerByUuid } from '../customer.api';
import type { CustomerDetail } from '../customer.types';
import { usePermission } from '../../../hooks/usePermission';
import { useSnackbar } from '../../../components/ui/SnackbarProvider';

export default function CustomerEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission('crm.customers');

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uuid) return;
    getCustomerByUuid(uuid)
      .then(setCustomer)
      .catch(() => {
        showSnackbar({ message: t('common.loadFailed'), severity: 'error' });
        navigate('/app/crm/customers');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleUpdate(data: CustomerFormValues) {
    if (!customer) return;
    try {
      const cleaned = Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, v === '' ? undefined : v]),
      );
      await updateCustomerByUuid(customer.uuid, {
        ...(cleaned as CustomerFormValues),
        version_no: customer.version_no,
      });
      showSnackbar({ message: t('common.updatedSuccess'), severity: 'success' });
      navigate('/app/crm/customers');
    } catch (err: any) {
      if (err?.response?.status === 409) {
        showSnackbar({
          message: err?.response?.data?.detail ?? t('common.updateConflict'),
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
        <Link component={RouterLink} to="/app/crm/customers" underline="hover">
          {t('menu.crm.customers')}
        </Link>
        <Typography color="text.primary">{t('common.edit')}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        {loading || !customer ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <CustomerForm defaultValues={customer} onSubmit={handleUpdate} />
        )}
      </Paper>
    </Box>
  );
}
