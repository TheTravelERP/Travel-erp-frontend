import { Box, Typography } from '@mui/material';
export default function Footer() {
  return (
    <Box component="footer" p={2} textAlign="center" color="text.secondary">
      <Typography variant="caption">© {new Date().getFullYear()} Travel ERP</Typography>
    </Box>
  );
}
