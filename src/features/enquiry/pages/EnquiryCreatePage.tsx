// src/features/enquiry/pages/EnquiryCreatePage.tsx
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import EnquiryForm from '../components/EnquiryForm';
import type { EnquiryFormInput } from "../enquiry.types";
import { createEnquiry}from '../enquiry.api';
import { usePermission } from '../../../hooks/usePermission';
import { useSnackbar } from '../../../components/ui/SnackbarProvider';
import FormPageLayout from '../../../components/forms/FormPageLayout';

export default function EnquiryCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission('crm.enquiries');

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: EnquiryFormInput) {
    try {
      await createEnquiry(data);
      showSnackbar({ message: t('common.createdSuccess'), severity: 'success' });
      navigate('/app/enquiries');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t('common.createFailed');

      showSnackbar({ message: msg, severity: 'error' });
    }
  }

  return (
    <FormPageLayout
      title={t('common.create')}
      breadcrumbs={[
        { label: t('menu.dashboard'), href: '/app/dashboard' },
        { label: t('menu.crm.enquiries'), href: '/app/enquiries' },
        { label: t('common.create') },
      ]}
    >
      <EnquiryForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
