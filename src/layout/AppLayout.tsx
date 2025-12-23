// layout/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import { useState } from 'react';

import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const drawerWidth = 260;

export default function AppLayout() {
  const [open, setOpen] = useState(true);
  const toggleSidebar = () => setOpen((prev) => !prev);

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Sidebar open={open} drawerWidth={drawerWidth} />

      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Header
          toggleSidebar={toggleSidebar}
          open={open}
          drawerWidth={drawerWidth}
        />

        {/* Spacer for fixed AppBar */}
        <Toolbar />

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
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
