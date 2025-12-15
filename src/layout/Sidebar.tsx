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

import { useMenu } from "../context/MenuContext";

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

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// Icon Map
const IconMap: any = {
  Dashboard: DashboardIcon,
  People: PeopleIcon,
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
}: any) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();

  const { menu, loading } = useMenu();

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [manualToggle, setManualToggle] = useState(false);

  const filterViewable = (items: any[]) =>
    items
      .filter(item => item.permissions?.can_view !== false)
      .map(item => ({
        ...item,
        children: item.children ? filterViewable(item.children) : undefined,
      }));

  const menuItems = filterViewable(menu);

  const toggleSubmenu = (id: string) => {
    setManualToggle(true);
    setOpenSubmenu(prev => (prev === id ? null : id));
  };

  useEffect(() => {
    menuItems.forEach(item => {
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

  useEffect(() => {
    setManualToggle(false);
  }, [pathname]);

  if (loading) {
    return (
      <Drawer open={open} variant="persistent">
        <Toolbar />
        <Typography sx={{ p: 2 }}>Loading menu…</Typography>
      </Drawer>
    );
  }

  const renderItem = (item: any, isSubItem = false) => {
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
            ...(isSubItem && { mx: 1, pl: 4 }),
          }}
        >
          {!isSubItem && IconComponent && (
            <ListItemIcon sx={{ minWidth: 36, color: itemColor }}>
              <IconComponent fontSize="small" />
            </ListItemIcon>
          )}

          <ListItemText primary={item.title} />

          {hasChildren &&
            (isCurrentOpen ? (
              <KeyboardArrowDownIcon fontSize="small" />
            ) : (
              <KeyboardArrowRightIcon fontSize="small" />
            ))}
        </ListItemButton>

        {hasChildren && (
          <Collapse in={isCurrentOpen}>
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
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          borderRight: `1px dashed ${theme.palette.divider}`,
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>{menuItems.map(item => renderItem(item))}</List>
    </Drawer>
  );
}
