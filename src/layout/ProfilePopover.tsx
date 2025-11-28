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
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import FolderSharedIcon from "@mui/icons-material/FolderShared";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SecurityIcon from "@mui/icons-material/Security";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../auth/context/AuthContext";
import { useSnackbar } from "../components/ui/SnackbarProvider";

interface ProfilePopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

// Dummy User – replace with real data later
const USER_DATA = {
  name: "Jaydon Frankie",
  email: "demo@minimals.cc",
  avatarUrl: "",
};

const MENU_OPTIONS = [
  { label: "Home", icon: HomeIcon, path: "/dashboard" },
  { label: "Profile", icon: PersonIcon, path: "/profile" },
  { label: "Projects", icon: FolderSharedIcon, path: "/projects", badge: 3 },
  { label: "Subscription", icon: AttachMoneyIcon, path: "/subscription" },
  { label: "Security", icon: SecurityIcon, path: "/security" },
  { label: "Account settings", icon: SettingsIcon, path: "/settings" },
];

export default function ProfilePopover({
  anchorEl,
  open,
  onClose,
}: ProfilePopoverProps) {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const { showSnackbar } = useSnackbar();

  // navigation inside popover
  const handleNavigation = (path: string) => {
    onClose();
    navigate(path);
  };

  // LOGOUT HANDLER
  const handleLogout = async () => {
    onClose();
    await logout(); // clears token + user state

    showSnackbar({
      message: "Logged out successfully",
      severity: "success",
    });

    navigate("/login", { replace: true });
  };

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: {
          p: 0,
          mt: 1.5,
          ml: 0.75,
          width: 280,
          borderRadius: 2,
          boxShadow: (theme) => theme.shadows[20],
        },
      }}
    >
      {/* USER INFO */}
      <Box sx={{ my: 1.5, px: 2.5 }}>
        <Box display="flex" alignItems="center">
          <Avatar
            alt={USER_DATA.name}
            src={USER_DATA.avatarUrl}
            sx={{ width: 48, height: 48, mr: 2 }}
          />
          <Box>
            <Typography variant="subtitle1" noWrap>
              {USER_DATA.name}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }} noWrap>
              {USER_DATA.email}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* TEAM AVATARS */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          p: 2,
          pt: 0,
          pb: 2,
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex" }}>
          <Avatar sx={{ width: 30, height: 30, mr: 0.5 }} />
          <Avatar sx={{ width: 30, height: 30, mr: 0.5 }} />
          <Avatar sx={{ width: 30, height: 30 }} />
        </Box>

        <IconButton
          size="small"
          sx={{
            width: 30,
            height: 30,
            bgcolor: (theme) => theme.palette.grey[300],
            "&:hover": { bgcolor: (theme) => theme.palette.grey[400] },
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider sx={{ borderStyle: "dashed" }} />

      {/* MENU OPTIONS */}
      <Box sx={{ py: 1 }}>
        {MENU_OPTIONS.map((option) => {
          const IconComponent = option.icon;
          return (
            <MenuItem
              key={option.label}
              onClick={() => handleNavigation(option.path)}
              sx={{ py: 1, "&:hover": { bgcolor: "action.hover" } }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <IconComponent
                  sx={{ width: 20, height: 20, color: "text.secondary" }}
                />
              </ListItemIcon>

              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {option.label}
              </Typography>

              {option.badge && (
                <Box
                  sx={{
                    bgcolor: "error.main",
                    color: "white",
                    borderRadius: 1,
                    px: 0.8,
                    py: 0.1,
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {option.badge}
                </Box>
              )}
            </MenuItem>
          );
        })}
      </Box>

      <Divider sx={{ borderStyle: "dashed" }} />

      {/* LOGOUT BUTTON */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          color="error"
          onClick={handleLogout}
          sx={{
            borderRadius: 1.5,
            fontWeight: 700,
            py: 1.2,
          }}
        >
          Logout
        </Button>
      </Box>
    </Menu>
  );
}
