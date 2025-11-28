// layout/AppLayout.tsx
import { Outlet } from "react-router-dom";
import { Box, Toolbar, useTheme } from "@mui/material";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useState } from "react";

const drawerWidth = 260; 
const sidebarBgColor = '#FFFFFF'; 

export default function AppLayout() {
  const [open, setOpen] = useState(true);
  const toggleSidebar = () => setOpen((prev) => !prev);
  const theme = useTheme();
  return (
    <Box 
      display="flex" 
      minHeight="100vh" 
      sx={{ bgcolor: theme.palette.grey[50] }} 
    >
      
      <Sidebar 
        open={open} 
        drawerWidth={drawerWidth} 
        sidebarBgColor={sidebarBgColor} 
      />

      <Box flexGrow={1} display="flex" flexDirection="column">
        
        <Header 
          toggleSidebar={toggleSidebar} 
          open={open} 
          drawerWidth={drawerWidth} 
        />

        <Toolbar /> 
        
        <Box 
          component="main" 
          flexGrow={1} 
          p={3} 
          sx={{ transition: theme.transitions.create('margin') }}
        >
          <Outlet /> 
        </Box>

        <Footer />
      </Box>
    </Box>
  );
}