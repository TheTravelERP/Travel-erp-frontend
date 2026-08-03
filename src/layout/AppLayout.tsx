// layout/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';

import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const drawerWidth = 260;

export default function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [open, setOpen] = useState(!isMobile);

  // Collapse behind the hamburger the moment the viewport crosses into the
  // same "md" breakpoint the list pages already switch to card view at.
  // Without this, the persistent 260px drawer keeps eating into a width the
  // page never has to spare, forcing the whole layout to scroll
  // horizontally instead of the mobile card layout actually fitting.
  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => setOpen((prev) => !prev);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Sidebar
        open={open}
        drawerWidth={drawerWidth}
        variant={isMobile ? 'temporary' : 'persistent'}
        onClose={() => setOpen(false)}
      />

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header
          toggleSidebar={toggleSidebar}
          open={open && !isMobile}
          drawerWidth={drawerWidth}
        />

        {/* Spacer for fixed AppBar */}
        <Toolbar />

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
            p: 2, // consistent app padding
          }}
        >
          <Outlet />
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}
