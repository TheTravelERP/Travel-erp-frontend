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
  styled,
} from "@mui/material";

import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { alpha } from "@mui/material/styles";

import { useMenu } from "../context/MenuContext";
import Icon from "@mui/material/Icon";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Logo from "../assets/logo.png";

/* ---------------- ICON MAP ---------------- */

/* ---------------- STYLED COMPONENTS ---------------- */

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "drawerWidth",
})<{ drawerWidth: number }>(({ theme, drawerWidth, open }) => ({
  width: open ? drawerWidth : 0,
  flexShrink: 0,
  whiteSpace: "nowrap",
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: open
      ? theme.transitions.duration.enteringScreen
      : theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",

  "& .MuiDrawer-paper": {
    width: drawerWidth,
    borderRight: `1px dashed ${theme.palette.divider}`,
  },
}));

const LogoToolbar = styled(Toolbar)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
}));

const LogoImage = styled("img")({
  height: 36,
  width: "auto",
});

const MenuItemButton = styled(ListItemButton)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  marginTop: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
}));

const SubMenuItemButton = styled(MenuItemButton)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  paddingLeft: theme.spacing(4),
}));

/* ---------------- COMPONENT ---------------- */

export default function Sidebar({ open, drawerWidth = 280 }: any) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();
  const { t } = useTranslation();

  const { menu, loading } = useMenu();

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [manualToggle, setManualToggle] = useState(false);

  const filterViewable = (items: any[]) =>
    items
      .filter((item) => item.permissions?.can_view !== false)
      .map((item) => ({
        ...item,
        children: item.children ? filterViewable(item.children) : undefined,
      }));

  const menuItems = filterViewable(menu);

  const toggleSubmenu = (id: string) => {
    setManualToggle(true);
    setOpenSubmenu((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child: any) => child.path && pathname.startsWith(child.path),
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
      <StyledDrawer open={open} variant="persistent" drawerWidth={drawerWidth}>
        <Toolbar />
        <Typography sx={{ p: 2 }}>{t("common.loadingMenu")}</Typography>
      </StyledDrawer>
    );
  }

  const renderItem = (item: any, isSubItem = false) => {
    const hasChildren = item.children?.length > 0;
    const isCurrentOpen = openSubmenu === item.id;
    const isActive = item.path ? pathname === item.path : false;

    const isParentActive =
      hasChildren &&
      item.children.some(
        (child: any) => child.path && pathname.startsWith(child.path),
      );

    const itemColor =
      isActive || isParentActive
        ? theme.palette.primary.main
        : theme.palette.text.primary;

    const itemBg = isActive
      ? alpha(theme.palette.primary.main, 0.1)
      : "transparent";

    const ButtonComponent = isSubItem ? SubMenuItemButton : MenuItemButton;

    return (
      <Box key={item.id}>
        <ButtonComponent
          onClick={() =>
            hasChildren ? toggleSubmenu(item.id) : navigate(item.path)
          }
          sx={{
            color: itemColor,
            backgroundColor: itemBg,
          }}
        >
          {item.icon && (
            <ListItemIcon
              sx={{
                minWidth: isSubItem ? 34 : 40,
                color: itemColor,
              }}
            >
              <Icon
                baseClassName="material-symbols-rounded"
                sx={{
                  fontSize: isSubItem ? 20 : 22,
                }}
              >
                {item.icon}
              </Icon>
            </ListItemIcon>
          )}

          <ListItemText primary={t(`menu.${item.id}`, item.title)} />

          {hasChildren &&
            (isCurrentOpen ? (
              <KeyboardArrowDownIcon fontSize="small" />
            ) : (
              <KeyboardArrowRightIcon fontSize="small" />
            ))}
        </ButtonComponent>

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
    <StyledDrawer variant="persistent" open={open} drawerWidth={drawerWidth}>
      <LogoToolbar onClick={() => navigate("/app/dashboard")}>
        <LogoImage src={Logo} alt="Travel ERP" />
      </LogoToolbar>

      <Divider />

      <List>{menuItems.map((item: any) => renderItem(item))}</List>
    </StyledDrawer>
  );
}
