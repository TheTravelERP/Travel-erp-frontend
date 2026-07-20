// layout/Header.tsx
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  styled,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import Badge from '@mui/material/Badge';
import { useState } from 'react';

import ProfilePopover from './ProfilePopover';
import UserAvatar from '../components/common/UserAvatar';
import Logo2 from '../assets/Logo2.png';
import { useAuthContext } from '../auth/context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
  open: boolean;
  drawerWidth: number;
}

interface AppBarShiftProps {
  open: boolean;
  drawerWidth: number;
}

/* ---------- Styled AppBar ---------- */
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

/* ---------- Styled Logo ---------- */
const Logo = styled('img')(({ theme }) => ({
  height: 36,
  display: 'block',
  marginLeft: theme.spacing(1),
}));

export default function Header({
  toggleSidebar,
  open,
  drawerWidth,
}: HeaderProps) {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const notificationCount = 5;
  const { session } = useAuthContext();

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorElUser(null);

  return (
    <>
      <AppBarShift position="fixed" open={open} drawerWidth={drawerWidth}>
        {/* Toolbar spacing & height come from theme */}
        <Toolbar>
          {/* Sidebar Toggle */}
          <IconButton edge="start" color="inherit" onClick={toggleSidebar}>
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Logo src={Logo2} alt="Travel ERP Logo" />

          <Box sx={{ flexGrow: 1 }} />

          {/* Notifications */}
          <IconButton color="inherit">
            <Badge badgeContent={notificationCount} color="error" max={99}>
              <NotificationsNoneIcon />
            </Badge>
          </IconButton>

          {/* Profile */}
          <IconButton onClick={handleProfileMenuOpen}>
            <UserAvatar name={session?.name} email={session?.email} pictureUrl={session?.picture_url} />
          </IconButton>
        </Toolbar>
      </AppBarShift>

      <ProfilePopover
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={handleMenuClose}
      />
    </>
  );
}
