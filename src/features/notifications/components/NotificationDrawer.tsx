// src/features/notifications/components/NotificationDrawer.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListSubheader,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import InboxIcon from "@mui/icons-material/Inbox";
import DoneAllIcon from "@mui/icons-material/DoneAll";

import { archiveNotification, getNotifications, markAllNotificationsRead, markNotificationRead } from "../notification.api";
import { emitNotificationsChanged } from "../notification.events";
import type { NotificationListItem } from "../notification.types";
import { getRelatedRecordPath, groupByDate, type NotificationDateGroup } from "../notification.utils";
import { useLocalizationProfile } from "../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../utils/formatters/localization";

const DRAWER_PAGE_SIZE = 20;
const GROUP_ORDER: NotificationDateGroup[] = ["today", "yesterday", "earlier"];

interface Props {
  open: boolean;
  onClose: () => void;
  onUnreadCountChange: (count: number) => void;
}

export default function NotificationDrawer({ open, onClose, onUnreadCountChange }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const localizationProfile = useLocalizationProfile();
  const { formatDateTime } = useMemo(() => createFormatters(localizationProfile), [localizationProfile]);

  const [rows, setRows] = useState<NotificationListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      try {
        const res = await getNotifications(
          { page: 1, page_size: DRAWER_PAGE_SIZE, is_archived: false },
          controller.signal,
        );
        setRows(res.data);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [open]);

  const unreadRemaining = () => rows.filter((r) => !r.is_read).length;

  const handleOpenNotification = async (row: NotificationListItem) => {
    if (!row.is_read) {
      await markNotificationRead(row.uuid);
      setRows((prev) => {
        const next = prev.map((r) => (r.uuid === row.uuid ? { ...r, is_read: true } : r));
        onUnreadCountChange(next.filter((r) => !r.is_read).length);
        return next;
      });
      emitNotificationsChanged();
    }

    const path = getRelatedRecordPath(row.related_entity_type, row.related_entity_uuid);
    if (path) {
      onClose();
      navigate(path);
    }
  };

  const handleArchive = async (row: NotificationListItem) => {
    await archiveNotification(row.uuid);
    setRows((prev) => {
      const next = prev.filter((r) => r.uuid !== row.uuid);
      onUnreadCountChange(next.filter((r) => !r.is_read).length);
      return next;
    });
    emitNotificationsChanged();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setRows((prev) => prev.map((r) => ({ ...r, is_read: true })));
    onUnreadCountChange(0);
    emitNotificationsChanged();
  };

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: rows.filter((r) => groupByDate(r.created_at) === group),
  })).filter((g) => g.items.length > 0);

  const groupLabel: Record<NotificationDateGroup, string> = {
    today: t("common.today"),
    yesterday: t("common.yesterday"),
    earlier: t("common.earlier"),
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 380, display: "flex", flexDirection: "column", height: "100%" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            {t("notificationCenter.title")}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Divider />

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1 }}>
          <Button
            size="small"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllRead}
            disabled={unreadRemaining() === 0}
          >
            {t("common.markAllRead")}
          </Button>
          <Button
            size="small"
            onClick={() => {
              onClose();
              navigate("/app/notifications");
            }}
          >
            {t("common.viewAll")}
          </Button>
        </Stack>

        <Divider />

        <Box sx={{ flex: 1, overflowY: "auto" }}>
          {loading && (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={28} />
            </Box>
          )}

          {!loading && rows.length === 0 && (
            <Box textAlign="center" py={6}>
              <InboxIcon sx={{ fontSize: 40, opacity: 0.4 }} />
              <Typography color="text.secondary">{t("common.noRecordsFound")}</Typography>
            </Box>
          )}

          {!loading &&
            grouped.map(({ group, items }) => (
              <List
                key={group}
                dense
                subheader={
                  <ListSubheader sx={{ bgcolor: "background.paper" }}>{groupLabel[group]}</ListSubheader>
                }
              >
                {items.map((row) => (
                  <ListItemButton
                    key={row.uuid}
                    alignItems="flex-start"
                    onClick={() => handleOpenNotification(row)}
                    sx={{
                      bgcolor: row.is_read ? "transparent" : "action.hover",
                      borderLeft: row.is_read ? "none" : "3px solid",
                      borderLeftColor: "primary.main",
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Typography fontWeight={row.is_read ? 400 : 700} noWrap>
                          {row.title}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchive(row);
                          }}
                        >
                          <ArchiveOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                        {row.message}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(row.created_at)}
                        </Typography>
                        {row.priority === "HIGH" && <Chip size="small" color="error" label={row.priority} />}
                      </Stack>
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            ))}
        </Box>
      </Box>
    </Drawer>
  );
}
