// layout/ProfilePopover.tsx
import { useState } from 'react';
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
  Select,
  CircularProgress,
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
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../auth/context/AuthContext';
import { useSnackbar } from '../components/ui/SnackbarProvider';
import UserAvatar from '../components/common/UserAvatar';
import { updatePreferredLanguageApi } from '../auth/services/auth.service';
import { SUPPORTED_LANGUAGES, type LanguageCode } from '../i18n';

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

const LanguageSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const LogoutContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

/* ---------------- data ---------------- */

const MENU_OPTIONS = [
  { labelKey: 'profile.home', icon: HomeIcon, path: '/dashboard' },
  { labelKey: 'profile.profile', icon: PersonIcon, path: '/profile' },
  { labelKey: 'profile.projects', icon: FolderSharedIcon, path: '/projects', badge: 3 },
  { labelKey: 'profile.subscription', icon: AttachMoneyIcon, path: '/subscription' },
  { labelKey: 'profile.changePassword', icon: SecurityIcon, path: '/app/profile/change-password' },
  { labelKey: 'profile.themeColor', icon: SettingsIcon, path: '/app/settings/theme-color' },
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
  const { t, i18n } = useTranslation();
  const { session, logout, updateSession } = useAuthContext();
  const { showSnackbar } = useSnackbar();
  const [changingLanguage, setChangingLanguage] = useState(false);

  const handleNavigation = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLanguageChange = async (next: LanguageCode) => {
    if (!next || next === session?.preferred_language) return;

    setChangingLanguage(true);
    try {
      await updatePreferredLanguageApi(next);
      updateSession({ preferred_language: next });
      i18n.changeLanguage(next);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail ?? 'Failed to update language',
        severity: 'error',
      });
    } finally {
      setChangingLanguage(false);
    }
  };

  const handleLogout = async () => {
    onClose();
    await logout();

    showSnackbar({
      message: t('profile.loggedOutSuccess'),
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
          <UserAvatar name={session?.name} email={session?.email} pictureUrl={session?.picture_url} />
          <Box ml={2}>
            <Typography variant="subtitle2" noWrap>
              {session?.name || session?.email}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {session?.email}
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

      {/* LANGUAGE */}
      <LanguageSection>
        <Typography variant="body2" color="text.secondary">
          {t('profile.language')}
        </Typography>
        <Select
          size="small"
          value={session?.preferred_language ?? 'en'}
          disabled={changingLanguage}
          onChange={(e) => handleLanguageChange(e.target.value as LanguageCode)}
          endAdornment={changingLanguage ? <CircularProgress size={14} sx={{ mr: 2 }} /> : undefined}
          sx={{ minWidth: 130 }}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              {lang.label}
            </MenuItem>
          ))}
        </Select>
      </LanguageSection>

      <Divider />

      {/* MENU OPTIONS */}
      {MENU_OPTIONS.map((option) => {
        const IconComponent = option.icon;

        return (
          <MenuItem key={option.labelKey} onClick={() => handleNavigation(option.path)}>
            <ListItemIcon>
              <IconComponent fontSize="small" />
            </ListItemIcon>

            <Typography variant="body2" flexGrow={1}>
              {t(option.labelKey)}
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
          {t('profile.logout')}
        </Button>
      </LogoutContainer>
    </PopoverMenu>
  );
}
