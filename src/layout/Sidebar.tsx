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

import navConfig from './navConfig.json';

// --- ICONS ---
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

// SPECIAL ICONS
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import LayersIcon from "@mui/icons-material/Layers";
import HotelIcon from "@mui/icons-material/Hotel";
import FlightIcon from "@mui/icons-material/Flight";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import SettingsIcon from "@mui/icons-material/Settings";

// Expand / Collapse Icons
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// Map your menu keys to actual Icons
const IconMap: any = {
  Dashboard: DashboardIcon,

  // CRM / Users
  People: PeopleIcon,
  User: PeopleIcon,
  EmojiPeople: EmojiPeopleIcon,

  // Sales / Packages
  ShoppingBag: ShoppingBagIcon,

  // Operations
  Layers: LayersIcon,

  // Inventory
  Inventory: InventoryIcon,
  Hotel: HotelIcon,
  Flight: FlightIcon,

  // Finance
  AttachMoney: AttachMoneyIcon,
  AccountBalance: AccountBalanceIcon,

  // Reports
  ShowChart: ShowChartIcon,

  // Support & Settings
  SupportAgent: SupportAgentIcon,
  Settings: SettingsIcon,
};

export default function Sidebar({
  open,
  drawerWidth = 280,
  menuItems = navConfig, // Use the imported JSON data as default
}: any) {
  const navigate = useNavigate();
  const { pathname } = useLocation(); 
  const theme = useTheme();
  
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Auto-expand submenu if current path is inside it
  useEffect(() => {
    if (menuItems) {
      menuItems.forEach((item: any) => {
        if (item.children) {
          // Check if the current pathname starts with the path of any child item
          const hasActiveChild = item.children.some((child: any) => 
            child.path && pathname.startsWith(child.path)
          );
          if (hasActiveChild && openSubmenu !== item.id) {
            setOpenSubmenu(item.id);
          }
        }
      });
    }
  }, [pathname, menuItems, openSubmenu]);

  const toggleSubmenu = (id: string) => {
    setOpenSubmenu(openSubmenu === id ? null : id);
  };

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

    // Use item.icon if provided, otherwise fallback to parent's IconMap key (if exists)
    const IconComponent = IconMap[item.icon] || (isSubItem ? undefined : IconMap[item.icon]);
    
    const hasChildren = item.children && item.children.length > 0;
    const isCurrentOpen = openSubmenu === item.id;
    const isActive = item.path ? pathname === item.path : false; 
    
    // Check if the parent menu is active (e.g., if any child link is active)
    const isParentActive = hasChildren && item.children.some((child: any) => 
        child.path && pathname.startsWith(child.path)
    );
    
    const itemColor = isActive || isParentActive ? theme.palette.primary.main : theme.palette.text.primary;
    const itemBg = isActive ? alpha(theme.palette.primary.main, 0.08) : "transparent";


    return (
      <Box key={item.id}>
        <ListItemButton
          onClick={() =>
            hasChildren ? toggleSubmenu(item.id) : item.path && navigate(item.path)
          }
          sx={{
            mx: 2,
            my: 0.5,
            borderRadius: 1.5,
            color: itemColor,
            bgcolor: itemBg,
            transition: "all 0.2s ease-in-out",

            "&:hover": {
              bgcolor: isActive 
                ? alpha(theme.palette.primary.main, 0.16) 
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
          {/* Show Icon for top-level items or sub-items with explicit icon */}
          {IconComponent && (
            <ListItemIcon
              sx={{
                minWidth: 36,
                color: itemColor,
              }}
            >
              <IconComponent fontSize="small" />
            </ListItemIcon>
          )}

          {/* If it's a sub-item without an icon, add a small dot */}
          {isSubItem && !IconComponent && (
             <Box
             component="span"
             sx={{
               width: 4,
               height: 4,
               borderRadius: "50%",
               bgcolor: isActive ? "primary.main" : "text.disabled",
               mr: 2,
               ml: 0.5
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

          {hasChildren &&
            (isCurrentOpen ? (
              <KeyboardArrowDownIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            ) : (
              <KeyboardArrowRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />
            ))}
        </ListItemButton>

        {hasChildren && (
          <Collapse in={isCurrentOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
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
      {/* Logo Section */}
      <Toolbar sx={{ px: 2.5, minHeight: 70 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
           <Box 
            sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'primary.main', 
                borderRadius: 1,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white'
            }}
           >
                <FlightIcon fontSize="small" />
           </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: -0.5 }}>
            Umrah<span style={{ color: theme.palette.primary.main }}>ERP</span>
            </Typography>
        </Box>
      </Toolbar>

      <Divider sx={{ borderStyle: 'dashed' }} />

      {/* Menu List */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", py: 2 }}>
        <List component="nav">
            {menuItems.map((item: any) => renderItem(item))}
        </List>
      </Box>
      
      {/* Optional: Footer snippet */}
      <Box sx={{ p: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
            v1.0.0 • Licensed to Org
        </Typography>
      </Box>
    </Drawer>
  );
}