// layout/ProfilePopover.tsx
import {
  Menu,
  MenuItem,
  Divider,
  Typography,
  Box,
  Avatar,
  IconButton,
  Button,
  ListItemIcon,
  styled,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../auth/context/AuthContext';
import { useSnackbar } from '../components/ui/SnackbarProvider';

/* ---------------- styled components ---------------- */

const PopoverMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    width: 280,
    marginTop: theme.spacing(1.5),
    marginLeft: theme.spacing(0.75),
    padding: 0,
    borderRadius: 0,
    boxShadow: theme.shadows[8],
  },
}));

const UserSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const UserRow = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
}));

const TeamSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  paddingTop: 0,
}));

const TeamAvatars = styled(Box)(() => ({
  display: 'flex',
}));

const AddTeamButton = styled(IconButton)(({ theme }) => ({
  width: 30,
  height: 30,
  backgroundColor: theme.palette.grey[300],
  '&:hover': {
    backgroundColor: theme.palette.grey[400],
  },
}));

const LogoutContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

/* ---------------- data ---------------- */

const USER_DATA = {
  name: 'Jaydon Frankie',
  email: 'demo@minimals.cc',
  avatarUrl: '',
};

const MENU_OPTIONS = [
  { label: 'Home', icon: HomeIcon, path: '/dashboard' },
  { label: 'Profile', icon: PersonIcon, path: '/profile' },
  { label: 'Projects', icon: FolderSharedIcon, path: '/projects', badge: 3 },
  { label: 'Subscription', icon: AttachMoneyIcon, path: '/subscription' },
  { label: 'Security', icon: SecurityIcon, path: '/security' },
  { label: 'Account settings', icon: SettingsIcon, path: '/settings' },
];

interface ProfilePopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

export default function ProfilePopover({
  anchorEl,
  open,
  onClose,
}: ProfilePopoverProps) {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const { showSnackbar } = useSnackbar();

  const handleNavigation = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    onClose();
    await logout();

    showSnackbar({
      message: 'Logged out successfully',
      severity: 'success',
    });

    navigate('/login', { replace: true });
  };

  return (
    <PopoverMenu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      {/* USER INFO */}
      <UserSection>
        <UserRow>
          <Avatar src={USER_DATA.avatarUrl} />
          <Box ml={2}>
            <Typography variant="subtitle2" noWrap>
              {USER_DATA.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {USER_DATA.email}
            </Typography>
          </Box>
        </UserRow>
      </UserSection>

      {/* TEAM */}
      <TeamSection>
        <TeamAvatars>
          <Avatar />
          <Avatar />
          <Avatar />
        </TeamAvatars>

        <AddTeamButton size="small">
          <AddIcon fontSize="small" />
        </AddTeamButton>
      </TeamSection>

      <Divider />

      {/* MENU OPTIONS */}
      {MENU_OPTIONS.map((option) => {
        const IconComponent = option.icon;

        return (
          <MenuItem key={option.label} onClick={() => handleNavigation(option.path)}>
            <ListItemIcon>
              <IconComponent fontSize="small" />
            </ListItemIcon>

            <Typography variant="body2" flexGrow={1}>
              {option.label}
            </Typography>

            {option.badge && (
              <Typography variant="caption" color="error">
                {option.badge}
              </Typography>
            )}
          </MenuItem>
        );
      })}

      <Divider />

      {/* LOGOUT */}
      <LogoutContainer>
        <Button
          fullWidth
          variant="contained"
          color="error"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </LogoutContainer>
    </PopoverMenu>
  );
}
