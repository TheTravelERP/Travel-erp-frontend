// layout/Sidebar.tsx
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Collapse,
  Divider,
  Box,
  useTheme,
} from "@mui/material";

import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { alpha } from "@mui/material/styles";

import navConfig from "./navConfig.json";

// --- ICONS ---
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import LayersIcon from "@mui/icons-material/Layers";
import HotelIcon from "@mui/icons-material/Hotel";
import FlightIcon from "@mui/icons-material/Flight";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SettingsIcon from "@mui/icons-material/Settings";

// Expand / Collapse Icons
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// Icon Map
const IconMap: any = {
  Dashboard: DashboardIcon,
  People: PeopleIcon,
  User: PeopleIcon,
  EmojiPeople: EmojiPeopleIcon,
  ShoppingBag: ShoppingBagIcon,
  Layers: LayersIcon,
  Inventory: InventoryIcon,
  Hotel: HotelIcon,
  Flight: FlightIcon,
  AttachMoney: AttachMoneyIcon,
  AccountBalance: AccountBalanceIcon,
  ShowChart: ShowChartIcon,
  SupportAgent: SupportAgentIcon,
  Settings: SettingsIcon,
};

export default function Sidebar({
  open,
  drawerWidth = 280,
  menuItems = navConfig,
}: any) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();

  // WHICH MENU IS OPEN
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // PREVENT AUTO-OVERRIDE WHEN USER CLICKS
  const [manualToggle, setManualToggle] = useState(false);

  // When user clicks parent menu
  const toggleSubmenu = (id: string) => {
    setManualToggle(true); // user intentionally clicked
    setOpenSubmenu((prev) => (prev === id ? null : id));
  };

  // Auto-expand ONLY on navigation — NOT when manually collapsed
  useEffect(() => {
    menuItems?.forEach((item: any) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child: any) => child.path && pathname.startsWith(child.path)
        );

        if (hasActiveChild && !manualToggle) {
          setOpenSubmenu(item.id);
        }
      }
    });
  }, [pathname, menuItems, manualToggle]);

  // Reset manual toggle after navigation
  useEffect(() => {
    setManualToggle(false);
  }, [pathname]);

  const renderItem = (item: any, isSubItem = false) => {
    if (item.type === "subheader") {
      return (
        <ListItemText
          key={item.title}
          primary={item.title}
          sx={{
            mt: 3,
            mb: 1,
            px: 3,
            color: theme.palette.text.disabled,
            ".MuiListItemText-primary": {
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            },
          }}
        />
      );
    }

    const IconComponent = IconMap[item.icon];
    const hasChildren = item.children?.length > 0;
    const isCurrentOpen = openSubmenu === item.id;
    const isActive = item.path ? pathname === item.path : false;

    const isParentActive =
      hasChildren &&
      item.children.some(
        (child: any) => child.path && pathname.startsWith(child.path)
      );

    const itemColor =
      isActive || isParentActive
        ? theme.palette.primary.main
        : theme.palette.text.primary;

    const itemBg = isActive
      ? alpha(theme.palette.primary.main, 0.1)
      : "transparent";

    return (
      <Box key={item.id}>
        <ListItemButton
          onClick={() =>
            hasChildren ? toggleSubmenu(item.id) : navigate(item.path)
          }
          sx={{
            mx: 2,
            my: 0.5,
            borderRadius: 1.5,
            bgcolor: itemBg,
            color: itemColor,

            "&:hover": {
              bgcolor: isActive
                ? alpha(theme.palette.primary.main, 0.18)
                : theme.palette.action.hover,
            },

            ...(isSubItem && {
              mx: 1,
              pl: 4,
              borderRadius: 1,
              mb: 0.2,
            }),
          }}
        >
          {/* ICON */}
          {!isSubItem && IconComponent && (
            <ListItemIcon sx={{ minWidth: 36, color: itemColor }}>
              <IconComponent fontSize="small" />
            </ListItemIcon>
          )}

          {/* DOT FOR SUBITEM WITHOUT ICON */}
          {isSubItem && !IconComponent && (
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                bgcolor: isActive ? "primary.main" : "text.disabled",
                mr: 2,
              }}
            />
          )}

          <ListItemText
            primary={item.title}
            primaryTypographyProps={{
              fontSize: isSubItem ? "0.85rem" : "0.875rem",
              fontWeight: isActive || isParentActive ? 600 : 500,
            }}
          />

          {/* Expand Arrow */}
          {hasChildren &&
            (isCurrentOpen ? (
              <KeyboardArrowDownIcon fontSize="small" sx={{ color: "text.secondary" }} />
            ) : (
              <KeyboardArrowRightIcon fontSize="small" sx={{ color: "text.disabled" }} />
            ))}
        </ListItemButton>

        {/* SUBMENU */}
        {hasChildren && (
          <Collapse in={isCurrentOpen} timeout="auto" unmountOnExit>
            <List disablePadding>
              {item.children.map((sub: any) => renderItem(sub, true))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          bgcolor: theme.palette.background.paper,
          borderRight: `1px dashed ${theme.palette.divider}`,
        },
      }}
    >
      {/* LOGO */}
      <Toolbar sx={{ px: 2.5, minHeight: 70 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              bgcolor: "primary.main",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
            }}
          >
            <FlightIcon fontSize="small" />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Umrah<span style={{ color: theme.palette.primary.main }}>ERP</span>
          </Typography>
        </Box>
      </Toolbar>

      <Divider sx={{ borderStyle: "dashed" }} />

      {/* MENU */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", py: 2 }}>
        <List>{menuItems.map((item: any) => renderItem(item))}</List>
      </Box>

      {/* FOOTER */}
      <Box sx={{ p: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          v1.0.0 • Licensed to Org
        </Typography>
      </Box>
    </Drawer>
  );
}
