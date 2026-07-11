// src/features/enquiry/pages/EnquiryCreatePage.tsx
import {
  Box,
  Breadcrumbs,
  Link,
  Paper,
  Typography,
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';

import EnquiryForm from '../components/EnquiryForm';
import type { EnquiryFormInput } from "../enquiry.types";
import { createEnquiry}from '../enquiry.api';
import { usePermission } from '../../../hooks/usePermission';
import { useSnackbar } from '../../../components/ui/SnackbarProvider';
import { Link as RouterLink } from 'react-router-dom';

export default function EnquiryCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const perms = usePermission('enquiries');

  // 🚫 Permission Guard
  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: EnquiryFormInput) {
    try {
      await createEnquiry(data);
      showSnackbar({ message: 'Enquiry created successfully', severity: 'success' });
      navigate('/app/enquiries');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create enquiry';

      showSnackbar({ message: msg, severity: 'error' });
    }
  }


  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      {/* Header */}
      <Typography variant="h6" fontWeight={700}>
        Create Enquiry
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/app/dashboard" underline="hover">
          Dashboard
        </Link>
        <Link component={RouterLink} to="/app/enquiries" underline="hover">
          Enquiries
        </Link>
        <Typography color="text.primary">Create</Typography>
      </Breadcrumbs>

      {/* Form */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <EnquiryForm onSubmit={handleCreate} />
      </Paper>
    </Box>
  );
}
