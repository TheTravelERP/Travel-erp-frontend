// src/features/settings/users/pages/UserCreatePage.tsx
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import UserForm from '../components/UserForm';
import { createUser } from '../users.api';
import { useSnackbar } from '../../../../components/ui/SnackbarProvider';
import FormPageLayout from '../../../../components/forms/FormPageLayout';

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
        message: t('common.createdSuccess'),
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
    <FormPageLayout
      title={t('common.add')}
      breadcrumbs={[
        { label: t('menu.dashboard'), href: '/app/dashboard' },
        { label: t('menu.settings.users'), href: '/app/settings/users' },
        { label: t('common.add') },
      ]}
    >
      <UserForm mode="create" onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
