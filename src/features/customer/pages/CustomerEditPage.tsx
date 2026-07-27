// src/features/customer/pages/CustomerEditPage.tsx
import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import CustomerForm from '../components/CustomerForm';
import type { CustomerFormValues } from '../components/CustomerForm';
import { getCustomerByUuid, updateCustomerByUuid } from '../customer.api';
import type { CustomerDetail } from '../customer.types';
import { usePermission } from '../../../hooks/usePermission';
import { useSnackbar } from '../../../components/ui/SnackbarProvider';
import FormPageLayout from '../../../components/forms/FormPageLayout';

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
    <FormPageLayout
      title={t('common.edit')}
      breadcrumbs={[
        { label: t('menu.dashboard'), href: '/app/dashboard' },
        { label: t('menu.crm.customers'), href: '/app/crm/customers' },
        { label: t('common.edit') },
      ]}
    >
      {loading || !customer ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <CustomerForm defaultValues={customer} onSubmit={handleUpdate} />
      )}
    </FormPageLayout>
  );
}
