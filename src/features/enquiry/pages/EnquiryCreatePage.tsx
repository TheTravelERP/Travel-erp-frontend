// src/features/enquiry/pages/EnquiryCreatePage.tsx
import {
  Box,
  Breadcrumbs,
  Link,
  Paper,
  Typography,
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import EnquiryForm from '../components/EnquiryForm';
import type { EnquiryFormInput } from "../enquiry.types";
import { createEnquiry}from '../enquiry.api';
import { usePermission } from '../../../hooks/usePermission';
import { useSnackbar } from '../../../components/ui/SnackbarProvider';
import { Link as RouterLink } from 'react-router-dom';

export default function EnquiryCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission('crm.enquiries');

  // 🚫 Permission Guard
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
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      {/* Header */}
      <Typography variant="h6" fontWeight={700}>
        {t('common.create')}
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/app/dashboard" underline="hover">
          {t('menu.dashboard')}
        </Link>
        <Link component={RouterLink} to="/app/enquiries" underline="hover">
          {t('menu.crm.enquiries')}
        </Link>
        <Typography color="text.primary">{t('common.create')}</Typography>
      </Breadcrumbs>

      {/* Form */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <EnquiryForm onSubmit={handleCreate} />
      </Paper>
    </Box>
  );
}
