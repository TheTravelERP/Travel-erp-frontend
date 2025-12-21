import {
  Box,
  Breadcrumbs,
  Link,
  Paper,
  Typography,
} from '@mui/material';
import { Navigate, useNavigate } from 'react-router-dom';

import EnquiryForm, { type EnquiryFormInput } from './components/EnquiryForm';
import { createEnquiry } from '../../../services/enquiry.service';
import { usePermission } from '../../../hooks/usePermission';
import { useSnackbar } from '../../../components/ui/SnackbarProvider';

export default function EnquiryCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const perms = usePermission('crm_enquiries');

  // 🚫 Permission Guard
  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: EnquiryFormInput) {
    await createEnquiry(data);
    showSnackbar({ message: 'Enquiry created successfully', severity: 'success' });
    navigate('/app/crm/enquiries');
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Typography variant="h6" fontWeight={700}>
        Create Enquiry
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/app/dashboard">
          Dashboard
        </Link>
        <Link underline="hover" color="inherit" href="/app/crm/enquiries">
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
