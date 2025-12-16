import { Box, Typography, Breadcrumbs, Link, Button, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

import EnquiryTable from './components/EnquiryTable';

export default function EnquiryListPage() {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Enquiries
          </Typography>

          <Breadcrumbs separator="•" sx={{ mt: 0.5 }}>
            <Link underline="hover" color="inherit" href="/app/dashboard">
              Dashboard
            </Link>
            <Typography color="text.primary">Enquiries</Typography>
          </Breadcrumbs>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/app/crm/enquiries/create')}
        >
          Add Enquiry
        </Button>
      </Box>

      {/* Content */}
      <Paper elevation={4} sx={{ p: { xs: 1.5, md: 3 }, borderRadius: 2 }}>
        <EnquiryTable />
      </Paper>
    </Box>
  );
}
