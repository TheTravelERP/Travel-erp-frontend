// src/features/customer/pages/CustomerCreatePage.tsx
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import CustomerForm from '../components/CustomerForm';
import type { CustomerFormValues } from '../components/CustomerForm';
import { createCustomer } from '../customer.api';
import { usePermission } from '../../../hooks/usePermission';
import { useSnackbar } from '../../../components/ui/SnackbarProvider';
import FormPageLayout from '../../../components/forms/FormPageLayout';

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
    <FormPageLayout
      title={t('common.create')}
      breadcrumbs={[
        { label: t('menu.dashboard'), href: '/app/dashboard' },
        { label: t('menu.crm.customers'), href: '/app/crm/customers' },
        { label: t('common.create') },
      ]}
    >
      <CustomerForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
