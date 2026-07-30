// src/features/notifications/components/NotificationGroupedView.tsx
//
// Smart Grouping (Phase 4, Feature 3). Groups are a server-computed summary
// (event_code + date, with a count) over the SAME rows the flat list shows —
// no duplicate records. Expanding a group re-fetches just that group's page
// via the existing /api/v1/notifications list endpoint (event_code +
// date-range filters), not a client-side filter of an unbounded set.
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InboxIcon from "@mui/icons-material/Inbox";
import { useTranslation } from "react-i18next";

import { getNotificationGroups, getNotifications } from "../notification.api";
import type { NotificationGroupItem, NotificationListItem } from "../notification.types";
import NotificationCenterTable from "./NotificationCenterTable";

interface Props {
  isArchived: boolean;
  onMarkRead: (row: NotificationListItem) => void;
  onArchive: (row: NotificationListItem) => void;
  onOpenRecord: (path: string) => void;
}

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function yesterdayIso(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function groupLabel(group: NotificationGroupItem, t: (k: string, o?: any) => string): string {
  const base = group.sample_title || group.event_code || t("notificationCenter.groupUntitled");
  const today = todayIso();
  const yesterday = yesterdayIso();

  if (group.date === today) return `${base} — ${t("common.today")} (${group.count})`;
  if (group.date === yesterday) return `${base} — ${t("common.yesterday")} (${group.count})`;
  return `${base} — ${group.date} (${group.count})`;
}

export default function NotificationGroupedView({ isArchived, onMarkRead, onArchive, onOpenRecord }: Props) {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<NotificationGroupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [groupRows, setGroupRows] = useState<Record<string, NotificationListItem[]>>({});
  const [groupLoading, setGroupLoading] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getNotificationGroups(isArchived, controller.signal)
      .then(setGroups)
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [isArchived]);

  const groupKey = (g: NotificationGroupItem) => `${g.event_code ?? "none"}::${g.date}`;

  const handleExpand = async (group: NotificationGroupItem) => {
    const key = groupKey(group);
    const next = expanded === key ? null : key;
    setExpanded(next);

    if (next && !groupRows[key]) {
      setGroupLoading(key);
      try {
        const res = await getNotifications({
          page: 1,
          page_size: 100,
          is_archived: isArchived,
          event_code: group.event_code || undefined,
          from_date: group.date,
          to_date: group.date,
        });
        setGroupRows((prev) => ({ ...prev, [key]: res.data }));
      } finally {
        setGroupLoading(null);
      }
    }
  };

  const refreshGroupRows = (key: string, group: NotificationGroupItem) => {
    getNotifications({
      page: 1,
      page_size: 100,
      is_archived: isArchived,
      event_code: group.event_code || undefined,
      from_date: group.date,
      to_date: group.date,
    }).then((res) => setGroupRows((prev) => ({ ...prev, [key]: res.data })));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (groups.length === 0) {
    return (
      <Box textAlign="center" py={5}>
        <InboxIcon sx={{ fontSize: 48, opacity: 0.4 }} />
        <Typography>{t("common.noRecordsFound")}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {groups.map((group) => {
        const key = groupKey(group);
        return (
          <Accordion
            key={key}
            expanded={expanded === key}
            onChange={() => handleExpand(group)}
            disableGutters
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" gap={1}>
                {group.has_unread && <Badge color="primary" variant="dot" />}
                <Typography fontWeight={group.has_unread ? 700 : 400}>
                  {groupLabel(group, t)}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {groupLoading === key ? (
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <NotificationCenterTable
                  rows={groupRows[key] || []}
                  loading={false}
                  page={1}
                  pageSize={100}
                  total={(groupRows[key] || []).length}
                  onPageChange={() => {}}
                  onPageSizeChange={() => {}}
                  onMarkRead={(row) => {
                    onMarkRead(row);
                    setGroupRows((prev) => ({
                      ...prev,
                      [key]: (prev[key] || []).map((r) => (r.uuid === row.uuid ? { ...r, is_read: true } : r)),
                    }));
                  }}
                  onArchive={(row) => {
                    onArchive(row);
                    refreshGroupRows(key, group);
                  }}
                  onOpenRecord={onOpenRecord}
                />
              )}
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
