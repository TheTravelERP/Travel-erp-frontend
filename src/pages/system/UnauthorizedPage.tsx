import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" fontWeight={700}>
        Access Denied
      </Typography>

      <Typography sx={{ mt: 1 }} color="text.secondary">
        You don’t have permission to view this page.
      </Typography>

      <Button
        variant="contained"
        sx={{ mt: 3 }}
        onClick={() => navigate('/app/dashboard')}
      >
        Go to Dashboard
      </Button>
    </Box>
  );
}
