// src/components/common/RowActionsMenu.tsx
//
// Generic per-row "⋮" actions menu for list/table pages — groups of
// MenuItems separated by dividers, with per-item permission/availability
// gating (show/disabled + a tooltip reason). Introduced for the Enquiry
// list's Actions menu (View/Edit | Follow-ups/Quotations/... | Convert to
// Booking/Clone/...) but written generically so the same "parent record →
// related module" navigation pattern (Customer → Bookings, Booking →
// Invoices, etc.) can reuse it without modification — just pass a
// different `groups` array.

import { useState, type ReactNode, type MouseEvent } from "react";
import { IconButton, Menu, MenuItem, Divider, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export interface RowAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  /** Visibility gate — hidden entirely when false. Defaults to true. */
  show?: boolean;
  /** Rendered but not clickable (e.g. a feature not built yet). */
  disabled?: boolean;
  /** Tooltip shown when disabled — e.g. "Coming soon". */
  disabledReason?: string;
  color?: "error" | "warning" | "inherit";
}

export type RowActionGroup = RowAction[];

interface RowActionsMenuProps {
  groups: RowActionGroup[];
  ariaLabel?: string;
}

export default function RowActionsMenu({ groups, ariaLabel = "row actions" }: RowActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  const visibleGroups = groups
    .map((group) => group.filter((a) => a.show !== false))
    .filter((group) => group.length > 0);

  return (
    <>
      <IconButton size="small" aria-label={ariaLabel} onClick={handleOpen}>
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {visibleGroups.map((group, groupIndex) => [
          groupIndex > 0 && <Divider key={`divider-${groupIndex}`} />,
          ...group.map((action) => {
            const item = (
              <MenuItem
                key={action.key}
                disabled={action.disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  if (action.disabled) return;
                  handleClose();
                  action.onClick?.();
                }}
                sx={action.color ? { color: `${action.color}.main` } : undefined}
              >
                {action.icon && <ListItemIcon sx={{ minWidth: 32 }}>{action.icon}</ListItemIcon>}
                <ListItemText>{action.label}</ListItemText>
              </MenuItem>
            );

            return action.disabled && action.disabledReason ? (
              <Tooltip key={action.key} title={action.disabledReason} placement="left">
                <span>{item}</span>
              </Tooltip>
            ) : (
              item
            );
          }),
        ])}
      </Menu>
    </>
  );
}
