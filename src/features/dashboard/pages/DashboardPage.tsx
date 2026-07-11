import { Typography, Box } from '@mui/material';
import Loader from '../../../components/common/Loader';


export default function DashboardPage() {
  return (
    <Loader message="Loading your dashboard..." />
    // <Box>
    //   <Typography variant="h5" mb={2}>Dashboard</Typography>
    //   <Typography>Welcome to your Travel ERP.</Typography>
    // </Box>
  );
}
