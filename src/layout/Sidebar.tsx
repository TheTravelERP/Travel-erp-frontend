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
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useMenu } from "../context/MenuContext";
import { useActiveMenuPath } from "./useActiveMenuPath";
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

export default function Sidebar({
  open,
  drawerWidth = 280,
  variant = "persistent",
  onClose,
}: {
  open: boolean;
  drawerWidth?: number;
  variant?: "persistent" | "temporary";
  onClose?: () => void;
}) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();
  const { t } = useTranslation();

  const { menu, loading } = useMenu();

  const filterViewable = (items: any[]) =>
    items
      .map((item) => ({
        ...item,
        children: item.children ? filterViewable(item.children) : undefined,
      }))
      .filter((item) => {
        const hasVisibleChildren = Boolean(item.children && item.children.length > 0);
        // A leaf node with no page of its own and no children is a
        // permission-gated feature flag (menu_type "Action", e.g. a tab's
        // Import/Export/Attachments permission key) — it exists only for
        // permission resolution, never as a clickable nav destination.
        if (!item.path && !hasVisibleChildren) return false;
        // A group header (e.g. "CRM") has no page of its own and no explicit
        // view grant, but must still show whenever any child under it is
        // visible — only drop an item if it's both un-viewable itself AND has
        // no visible children left.
        return item.permissions?.can_view !== false || hasVisibleChildren;
      });

  const menuItems = useMemo(() => filterViewable(menu), [menu]);

  // Single source of truth for "what's active": derived purely from the
  // URL, at any nesting depth. Drives both highlighting and auto-expand.
  const { activeLeafId, activeAncestorIds } = useActiveMenuPath(
    menuItems,
    pathname,
  );

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [manualToggle, setManualToggle] = useState(false);

  // Auto-expand every ancestor of the active route, unless the user has
  // manually opened/closed a submenu since the last navigation.
  useEffect(() => {
    if (!manualToggle) {
      setOpenIds(new Set(activeAncestorIds));
    }
  }, [pathname, activeAncestorIds, manualToggle]);

  useEffect(() => {
    setManualToggle(false);
  }, [pathname]);

  const toggleSubmenu = (id: string) => {
    setManualToggle(true);
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <StyledDrawer
        open={open}
        variant={variant}
        drawerWidth={drawerWidth}
        onClose={onClose}
        ModalProps={variant === "temporary" ? { keepMounted: true } : undefined}
      >
        <Toolbar />
        <Typography sx={{ p: 2 }}>{t("common.loadingMenu")}</Typography>
      </StyledDrawer>
    );
  }

  const renderItem = (item: any, depth = 0) => {
    const hasChildren = item.children?.length > 0;
    const isCurrentOpen = openIds.has(item.id);
    const isSubItem = depth > 0;

    // Active state comes entirely from the URL (via useActiveMenuPath),
    // not from click handlers, so it survives refresh, back/forward, and
    // direct URL access automatically.
    const isSelected = activeLeafId === item.id;
    const isAncestorActive = activeAncestorIds.has(item.id);
    const itemColor =
      isSelected || isAncestorActive
        ? theme.palette.primary.main
        : theme.palette.text.primary;

    const ButtonComponent = isSubItem ? SubMenuItemButton : MenuItemButton;

    return (
      <Box key={item.id}>
        <ButtonComponent
          selected={isSelected}
          onClick={() => {
            if (hasChildren) {
              toggleSubmenu(item.id);
              return;
            }
            navigate(item.path);
            // Temporary (mobile/overlay) drawer — get out of the way once a
            // destination is picked, same as any overlay nav menu.
            if (variant === "temporary") onClose?.();
          }}
          sx={{
            ...(depth > 1 ? { pl: 4 + (depth - 1) * 2 } : null),
            color: itemColor,
            "& .MuiListItemIcon-root": {
              color: itemColor,
            },
          }}
        >
          {item.icon && (
            <ListItemIcon
              sx={{
                minWidth: isSubItem ? 34 : 40,
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
              {item.children.map((sub: any) => renderItem(sub, depth + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <StyledDrawer
      variant={variant}
      open={open}
      drawerWidth={drawerWidth}
      onClose={onClose}
      ModalProps={variant === "temporary" ? { keepMounted: true } : undefined}
    >
      <LogoToolbar onClick={() => navigate("/app/dashboard")}>
        <LogoImage src={Logo} alt="Travel ERP" />
      </LogoToolbar>

      <Divider />

      <List>{menuItems.map((item: any) => renderItem(item))}</List>
    </StyledDrawer>
  );
}
