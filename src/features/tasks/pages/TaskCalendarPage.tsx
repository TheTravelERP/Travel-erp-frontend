// src/features/tasks/pages/TaskCalendarPage.tsx
//
// Agenda-style calendar — tasks for the selected month grouped by due date,
// plus a standing "Overdue" group. Deliberately not a full month-grid
// widget (no new UI dependency); the ORG-scoped tasks.calendar menu is
// about surfacing what's due, not a full scheduling UI.
import { useEffect, useMemo, useState } from "react";
import { Box, Button, CircularProgress, IconButton, Paper, Stack, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import ListPageToolbar from "../../../components/common/ListPageToolbar";
import DropdownColorChip from "../../../components/common/DropdownColorChip";
import { usePermission } from "../../../hooks/usePermission";
import { getTasks } from "../task.api";
import type { TaskListItem } from "../task.types";
import { useLocalizationProfile } from "../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../utils/formatters/localization";

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function TaskCalendarPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const perms = usePermission("tasks.calendar");
  const localizationProfile = useLocalizationProfile();
  const { formatDate } = createFormatters(localizationProfile);

  const [monthStart, setMonthStart] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [rows, setRows] = useState<TaskListItem[]>([]);
  const [overdueRows, setOverdueRows] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const monthEnd = useMemo(() => new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0), [monthStart]);
  const monthLabel = monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    Promise.all([
      getTasks(
        { menu_key: "tasks.calendar", from_date: toISODate(monthStart), to_date: toISODate(monthEnd), page_size: 100 },
        controller.signal,
      ),
      getTasks(
        { menu_key: "tasks.calendar", to_date: toISODate(new Date(Date.now() - 86400000)), status: "Pending", page_size: 100 },
        controller.signal,
      ),
    ])
      .then(([monthRes, overdueRes]) => {
        if (controller.signal.aborted) return;
        setRows(monthRes.data);
        setOverdueRows(overdueRes.data);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthStart]);

  const grouped = useMemo(() => {
    const map = new Map<string, TaskListItem[]>();
    for (const task of rows) {
      const key = task.due_date || t("tasks.noDueDate");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [rows, t]);

  function renderTaskRow(task: TaskListItem) {
    return (
      <Box
        key={task.uuid}
        sx={{ cursor: "pointer", py: 0.75, borderBottom: "1px solid", borderColor: "divider" }}
        onClick={() => navigate(`/app/tasks/${task.uuid}`)}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
          <Typography variant="body2" fontWeight={600}>{task.title}</Typography>
          <DropdownColorChip dropdownName="task_status" value={task.status} />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {task.assigned_to_name || "-"}{task.linked_entity_label ? ` • ${task.linked_entity_label}` : ""}
        </Typography>
      </Box>
    );
  }

  if (!perms.can_view) {
    return null;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <ListPageToolbar
        title={t("menu.tasks.calendar")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: t("menu.tasks.calendar") },
        ]}
      />

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 2 }}>
          <IconButton onClick={() => setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth() - 1, 1))}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" sx={{ minWidth: 180, textAlign: "center" }}>{monthLabel}</Typography>
          <IconButton onClick={() => setMonthStart(new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1))}>
            <ChevronRightIcon />
          </IconButton>
          <Button size="small" onClick={() => setMonthStart(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>
            {t("common.today")}
          </Button>
        </Stack>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
        ) : (
          <>
            {overdueRows.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                  {t("tasks.overdue")} ({overdueRows.length})
                </Typography>
                {overdueRows.map(renderTaskRow)}
              </Box>
            )}

            {grouped.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                {t("common.noRecordsFound")}
              </Typography>
            ) : (
              grouped.map(([date, tasks]) => (
                <Box key={date} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                    {date === t("tasks.noDueDate") ? date : formatDate(date)}
                  </Typography>
                  {tasks.map(renderTaskRow)}
                </Box>
              ))
            )}
          </>
        )}
      </Paper>
    </Box>
  );
}
