// src/components/common/ListPageToolbar.tsx

import { useState, type ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Button,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export interface ToolbarAction {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: "contained" | "outlined" | "text";
  color?: "primary" | "error" | "success" | "inherit";
  onClick?: () => void;
  /** Renders as a dropdown button (e.g. Export -> CSV/Excel/PDF) instead of a plain click action. */
  menuItems?: { label: string; onClick: () => void }[];
  /** Visibility gate — permission check or view-state condition. Defaults to true. */
  show?: boolean;
  disabled?: boolean;
  /** Tooltip shown when disabled (e.g. "Coming soon"). */
  disabledReason?: string;
}

interface Breadcrumb {
  label: string;
  href?: string;
}

interface ListPageToolbarProps {
  title: string;
  breadcrumbs: Breadcrumb[];
  /** The one bold call-to-action, e.g. "Add Enquiry". Never collapses into the overflow menu. */
  primaryAction?: ToolbarAction;
  /** Inline buttons (Filters, Export, Import). Collapse into the overflow menu on small screens. */
  secondaryActions?: ToolbarAction[];
  /** Always-collapsed items (Bulk Assign, View Trash, etc.). */
  overflowActions?: ToolbarAction[];
}

function visible(actions: ToolbarAction[] = []) {
  return actions.filter((a) => a.show !== false);
}

function ActionButton({ action }: { action: ToolbarAction }) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const button = (
    <Button
      variant={action.variant ?? "outlined"}
      color={action.color ?? "primary"}
      startIcon={action.icon}
      disabled={action.disabled}
      onClick={(e) =>
        action.menuItems ? setAnchor(e.currentTarget) : action.onClick?.()
      }
    >
      {action.label}
    </Button>
  );

  const wrapped =
    action.disabled && action.disabledReason ? (
      <Tooltip title={action.disabledReason}>
        <span>{button}</span>
      </Tooltip>
    ) : (
      button
    );

  if (!action.menuItems) return wrapped;

  return (
    <>
      {wrapped}
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {action.menuItems.map((mi) => (
          <MenuItem
            key={mi.label}
            onClick={() => {
              mi.onClick();
              setAnchor(null);
            }}
          >
            {mi.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function OverflowMenuItem({
  action,
  onDone,
}: {
  action: ToolbarAction;
  onDone: () => void;
}) {
  const item = (
    <MenuItem
      disabled={action.disabled}
      onClick={() => {
        action.onClick?.();
        onDone();
      }}
    >
      {action.label}
    </MenuItem>
  );

  if (action.disabled && action.disabledReason) {
    return (
      <Tooltip title={action.disabledReason} placement="left">
        <span>{item}</span>
      </Tooltip>
    );
  }

  return item;
}

export default function ListPageToolbar({
  title,
  breadcrumbs,
  primaryAction,
  secondaryActions = [],
  overflowActions = [],
}: ListPageToolbarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [moreAnchor, setMoreAnchor] = useState<null | HTMLElement>(null);

  const visibleSecondary = visible(secondaryActions);
  const visibleOverflow = visible(overflowActions);
  const primary = primaryAction?.show !== false ? primaryAction : undefined;

  // On small screens, fold secondary actions into the overflow menu too,
  // so the header never wraps into a messy multi-row button stack.
  const inlineActions = isMobile ? [] : visibleSecondary;
  const menuActions = isMobile
    ? [...visibleSecondary, ...visibleOverflow]
    : visibleOverflow;

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
      flexWrap="wrap"
      gap={1}
      mb={1}
    >
      <Box>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>

        <Breadcrumbs separator="•" sx={{ mt: 0.5 }}>
          {breadcrumbs.map((b, i) =>
            b.href ? (
              <Link
                key={i}
                component={RouterLink}
                to={b.href}
                underline="hover"
                color="inherit"
              >
                {b.label}
              </Link>
            ) : (
              <Typography key={i} color="text.primary">
                {b.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      </Box>

      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        {primary && <ActionButton action={primary} />}

        {inlineActions.map((a) => (
          <ActionButton key={a.key} action={a} />
        ))}

        {menuActions.length > 0 && (
          <>
            <IconButton onClick={(e) => setMoreAnchor(e.currentTarget)}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={moreAnchor}
              open={Boolean(moreAnchor)}
              onClose={() => setMoreAnchor(null)}
            >
              {menuActions.map((a) =>
                a.menuItems ? (
                  a.menuItems.map((mi) => (
                    <MenuItem
                      key={`${a.key}-${mi.label}`}
                      onClick={() => {
                        mi.onClick();
                        setMoreAnchor(null);
                      }}
                    >
                      {mi.label}
                    </MenuItem>
                  ))
                ) : (
                  <OverflowMenuItem
                    key={a.key}
                    action={a}
                    onDone={() => setMoreAnchor(null)}
                  />
                ),
              )}
            </Menu>
          </>
        )}
      </Stack>
    </Box>
  );
}
