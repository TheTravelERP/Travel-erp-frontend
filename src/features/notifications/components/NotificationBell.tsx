// src/features/notifications/components/NotificationBell.tsx
import { useCallback, useEffect, useState } from "react";
import { IconButton, Badge } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

import { getUnreadCount } from "../notification.api";
import { onNotificationsChanged } from "../notification.events";
import NotificationDrawer from "./NotificationDrawer";

const POLL_INTERVAL_MS = 30000;

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  const refreshCount = useCallback(async () => {
    try {
      setUnreadCount(await getUnreadCount());
    } catch {
      // Silent — badge just skips this refresh cycle.
    }
  }, []);

  useEffect(() => {
    refreshCount();
    const interval = setInterval(refreshCount, POLL_INTERVAL_MS);
    const unsubscribe = onNotificationsChanged(refreshCount);
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [refreshCount]);

  return (
    <>
      <IconButton color="inherit" onClick={() => setOpen(true)}>
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <NotificationsNoneIcon />
        </Badge>
      </IconButton>

      <NotificationDrawer
        open={open}
        onClose={() => setOpen(false)}
        onUnreadCountChange={setUnreadCount}
      />
    </>
  );
}
