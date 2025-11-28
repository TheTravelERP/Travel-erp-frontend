// layout/Header.tsx
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Box,
  styled,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useState } from "react";
import ProfilePopover from "./ProfilePopover";

interface HeaderProps {
  toggleSidebar: () => void;
  open: boolean;
  drawerWidth: number;
}

// AppBar that shifts when sidebar opens
const AppBarShift = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open" && prop !== "drawerWidth",
})<HeaderProps>(({ theme, open, drawerWidth }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[1],
  zIndex: theme.zIndex.drawer + 1,

  transition: theme.transitions.create(["margin", "width"], {
    duration: theme.transitions.duration.leavingScreen,
  }),

  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(["margin", "width"], {
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export default function Header({ toggleSidebar, open, drawerWidth }: HeaderProps) {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorElUser(null);

  return (
    <>
      <AppBarShift position="fixed" open={open} drawerWidth={drawerWidth}>
        <Toolbar sx={{ minHeight: "64px !important" }}>
          
          {/* Sidebar Toggle */}
          <IconButton edge="start" color="inherit" onClick={toggleSidebar} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>

          {/* App Title */}
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Travel ERP
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* Profile Button */}
          <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
            <Avatar sx={{ width: 38, height: 38 }} />
          </IconButton>
        </Toolbar>
      </AppBarShift>

      {/* Popover */}
      <ProfilePopover
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={handleMenuClose}
      />
    </>
  );
}
