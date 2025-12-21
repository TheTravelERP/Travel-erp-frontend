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
import Logo2 from "../assets/Logo2.png"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import Badge from "@mui/material/Badge";


interface HeaderProps {
  toggleSidebar: () => void;
  open: boolean;
  drawerWidth: number;
}

// AppBar that shifts when sidebar opens
// const AppBarShift = styled(AppBar, {
//   shouldForwardProp: (prop) => prop !== "open" && prop !== "drawerWidth",
// })<HeaderProps>(({ theme, open, drawerWidth }) => ({
//   backgroundColor: theme.palette.background.paper,
//   color: theme.palette.text.primary,
//   boxShadow: theme.shadows[1],
//   zIndex: theme.zIndex.drawer + 1,

//   transition: theme.transitions.create(["margin", "width"], {
//     duration: theme.transitions.duration.leavingScreen,
//   }),

//   ...(open && {
//     width: `calc(100% - ${drawerWidth}px)`,
//     marginLeft: drawerWidth,
//     transition: theme.transitions.create(["margin", "width"], {
//       duration: theme.transitions.duration.enteringScreen,
//     }),
//   }),
// }));
interface AppBarShiftProps {
  open: boolean;
  drawerWidth: number;
}


const AppBarShift = styled(AppBar, {
  shouldForwardProp: (prop) =>
    prop !== 'open' && prop !== 'drawerWidth',
})<AppBarShiftProps>(({ theme, open, drawerWidth }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: theme.shadows[1],
  zIndex: theme.zIndex.drawer + 1,

  transition: theme.transitions.create(['margin', 'width'], {
    duration: theme.transitions.duration.leavingScreen,
  }),

  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
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
  const notificationCount = 5; // later from API / websocket

  


  return (
    <>
      {/* <AppBarShift position="fixed" open={open} drawerWidth={drawerWidth} toggleSidebar={function (): void {
        throw new Error("Function not implemented.");
      } }>
        <Toolbar sx={{ minHeight: "64px !important" }}>
          
          <IconButton edge="start" color="inherit" onClick={toggleSidebar} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>

          <Box
            component="img"
            src={Logo2}
            alt="Travel ERP Logo"
            sx={{
              height: 40,      // Adjust height as needed
              width: 'auto',    // Maintains aspect ratio
              display: 'block'  // Prevents baseline alignment issues
            }}
          />

          <Box sx={{ flexGrow: 1 }} />
            <IconButton
              color="inherit"
              sx={{ mr: 1 }}
              onClick={() => console.log("Open notifications")}
            >
              <Badge
                badgeContent={notificationCount}
                color="error"
                overlap="circular"
                max={99}
              >
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>

            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{ width: 38, height: 38 }} />
            </IconButton>
        </Toolbar>
      </AppBarShift> */}
      <AppBarShift position="fixed" open={open} drawerWidth={drawerWidth}>
        <Toolbar sx={{ minHeight: '64px !important' }}>
          {/* Sidebar Toggle */}
          <IconButton
            edge="start"
            color="inherit"
            onClick={toggleSidebar}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box
            component="img"
            src={Logo2}
            alt="Travel ERP Logo"
            sx={{ height: 40, width: 'auto', display: 'block' }}
          />

          <Box sx={{ flexGrow: 1 }} />

          {/* Notifications */}
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={notificationCount} color="error" max={99}>
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>

          {/* Profile */}
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
