// src/features/notifications/pages/NotificationCenterPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Grid, MenuItem, Paper, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import DoneAllIcon from "@mui/icons-material/DoneAll";

import ListPageToolbar from "../../../components/common/ListPageToolbar";
import { SearchInput } from "../../../components/ui/SearchInput";
import QuickDateRangeFilter from "../../../components/common/QuickDateRangeFilter";
import NotificationCenterTable from "../components/NotificationCenterTable";
import NotificationGroupedView from "../components/NotificationGroupedView";
import { usePermission } from "../../../hooks/usePermission";
import {
  archiveNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../notification.api";
import { emitNotificationsChanged } from "../notification.events";
import type { NotificationListItem } from "../notification.types";

const STATUS_OPTIONS = [
  { value: "unread", label: "unread" },
  { value: "read", label: "read" },
];

const PRIORITY_OPTIONS = ["LOW", "NORMAL", "HIGH"];

export default function NotificationCenterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const perms = usePermission("notifications.center");
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("page_size") || 20);

  const search = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const priorityFilter = searchParams.get("priority") || "";
  const archivedFilter = searchParams.get("archived") === "1";
  const fromDate = searchParams.get("from_date") || "";
  const toDate = searchParams.get("to_date") || "";
  const view = (searchParams.get("view") as "list" | "grouped") || "list";

  const [draftSearch, setDraftSearch] = useState(search);

  const [rows, setRows] = useState<NotificationListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const updateURL = (params: Record<string, unknown>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  const fetchData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res = await getNotifications(
        {
          page,
          page_size: pageSize,
          search: search || undefined,
          is_read: statusFilter === "read" ? true : statusFilter === "unread" ? false : undefined,
          priority: (priorityFilter as any) || undefined,
          is_archived: archivedFilter,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        },
        signal,
      );
      setRows(res.data);
      setTotal(res.pagination.total);
    } catch (err) {
      if (!axios.isCancel(err)) throw err;
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [searchParams]);

  const handleMarkRead = async (row: NotificationListItem) => {
    await markNotificationRead(row.uuid);
    setRows((prev) => prev.map((r) => (r.uuid === row.uuid ? { ...r, is_read: true } : r)));
    emitNotificationsChanged();
  };

  const handleArchive = async (row: NotificationListItem) => {
    await archiveNotification(row.uuid);
    if (!archivedFilter) {
      setRows((prev) => prev.filter((r) => r.uuid !== row.uuid));
      setTotal((prev) => prev - 1);
    } else {
      fetchData();
    }
    emitNotificationsChanged();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setRows((prev) => prev.map((r) => ({ ...r, is_read: true })));
    emitNotificationsChanged();
  };

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <ListPageToolbar
        title={t("notificationCenter.title")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: t("notificationCenter.title") },
        ]}
        secondaryActions={[
          {
            key: "markAllRead",
            label: t("common.markAllRead"),
            icon: <DoneAllIcon />,
            show: perms.can_edit,
            onClick: handleMarkAllRead,
          },
        ]}
      />

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("common.unread")}
              value={statusFilter}
              onChange={(e) => updateURL({ status: e.target.value || undefined, page: 1 })}
            >
              <MenuItem value="">{t("common.all")}</MenuItem>
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {t(`common.${s.value}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("notificationCenter.colPriority")}
              value={priorityFilter}
              onChange={(e) => updateURL({ priority: e.target.value || undefined, page: 1 })}
            >
              <MenuItem value="">{t("common.all")}</MenuItem>
              {PRIORITY_OPTIONS.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("common.archive")}
              value={archivedFilter ? "1" : "0"}
              onChange={(e) => updateURL({ archived: e.target.value === "1" ? "1" : undefined, page: 1 })}
            >
              <MenuItem value="0">{t("common.all")}</MenuItem>
              <MenuItem value="1">{t("common.archive")}</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <SearchInput
              placeholder={t("notificationCenter.searchPlaceholder")}
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              onSearch={() => updateURL({ search: draftSearch || undefined, page: 1 })}
              onClear={() => {
                setDraftSearch("");
                updateURL({ search: undefined, page: 1 });
              }}
            />
          </Grid>

          <QuickDateRangeFilter
            fromDate={fromDate}
            toDate={toDate}
            onChange={(v) => updateURL({ from_date: v.from_date, to_date: v.to_date, page: 1 })}
            gridSize={{ xs: 12, md: 3 }}
          />
        </Grid>

        <Box display="flex" justifyContent="flex-end" mb={2}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={view}
            onChange={(_, v) => v && updateURL({ view: v })}
          >
            <ToggleButton value="list">
              <ViewListIcon fontSize="small" sx={{ mr: 0.5 }} />
              {t("notificationCenter.viewList")}
            </ToggleButton>
            <ToggleButton value="grouped">
              <ViewAgendaIcon fontSize="small" sx={{ mr: 0.5 }} />
              {t("notificationCenter.viewGrouped")}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {view === "list" ? (
          <NotificationCenterTable
            rows={rows}
            loading={loading}
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={(p) => updateURL({ page: p })}
            onPageSizeChange={(s) => updateURL({ page_size: s, page: 1 })}
            onMarkRead={handleMarkRead}
            onArchive={handleArchive}
            onOpenRecord={(path) => navigate(path)}
          />
        ) : (
          <NotificationGroupedView
            isArchived={archivedFilter}
            onMarkRead={handleMarkRead}
            onArchive={handleArchive}
            onOpenRecord={(path) => navigate(path)}
          />
        )}
      </Paper>
    </Box>
  );
}
