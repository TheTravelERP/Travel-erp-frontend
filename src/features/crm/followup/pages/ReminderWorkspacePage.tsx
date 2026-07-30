// src/features/crm/followup/pages/ReminderWorkspacePage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Grid, Paper, Tab, Tabs } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import ListAltIcon from "@mui/icons-material/ListAlt";

import ListPageToolbar from "../../../../components/common/ListPageToolbar";
import { SearchInput } from "../../../../components/ui/SearchInput";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import ReminderWorkspaceTable from "../components/ReminderWorkspaceTable";
import { usePermission } from "../../../../hooks/usePermission";
import { getFollowups } from "../followup.api";
import type { FollowupListItem, ReminderBucket } from "../followup.types";

const BUCKETS: ReminderBucket[] = ["overdue", "today", "tomorrow", "upcoming", "completed"];

// "Overdue"/"Today"/"Tomorrow" reuse the same labels already used by the
// existing FollowupFilters quick-filter chips — only Upcoming/Completed
// are genuinely new bucket labels.
const BUCKET_LABEL_KEY: Record<ReminderBucket, string> = {
  overdue: "followup.filterOverdue",
  today: "followup.filterToday",
  tomorrow: "followup.filterTomorrow",
  upcoming: "followup.bucketUpcoming",
  completed: "followup.bucketCompleted",
};

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

/** Every bucket is expressible via the existing list endpoint's status +
 * next_from_date/next_to_date params — Overdue/Today/Tomorrow/Upcoming
 * partition Pending rows by calendar day (mutually exclusive, so a
 * reminder never shows in two tabs at once); Completed is its own
 * status-based bucket. No backend bucketing logic needed. */
function paramsForBucket(bucket: ReminderBucket): { status?: string; next_from_date?: string; next_to_date?: string } {
  const today = new Date();

  switch (bucket) {
    case "overdue":
      return { status: "Pending", next_to_date: toISODate(addDays(today, -1)) };
    case "today":
      return { status: "Pending", next_from_date: toISODate(today), next_to_date: toISODate(today) };
    case "tomorrow": {
      const tomorrow = addDays(today, 1);
      return { status: "Pending", next_from_date: toISODate(tomorrow), next_to_date: toISODate(tomorrow) };
    }
    case "upcoming":
      return { status: "Pending", next_from_date: toISODate(addDays(today, 2)) };
    case "completed":
      return { status: "Completed" };
  }
}

export default function ReminderWorkspacePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const perms = usePermission("crm.followups");
  const [searchParams, setSearchParams] = useSearchParams();

  const bucket = (searchParams.get("bucket") as ReminderBucket) || "today";
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("page_size") || 20);
  const search = searchParams.get("search") || "";
  const assignedUserUuid = searchParams.get("assigned_user_uuid") || "";
  const priority = searchParams.get("priority") || "";
  const followupType = searchParams.get("followup_type") || "";

  const [draftSearch, setDraftSearch] = useState(search);

  const [rows, setRows] = useState<FollowupListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState<Record<ReminderBucket, number>>({
    overdue: 0,
    today: 0,
    tomorrow: 0,
    upcoming: 0,
    completed: 0,
  });

  const updateURL = (params: Record<string, unknown>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === "") next.delete(key);
      else next.set(key, String(value));
    });
    setSearchParams(next);
  };

  const commonFilters = {
    search: search || undefined,
    assigned_user_uuid: assignedUserUuid || undefined,
    priority: priority || undefined,
    followup_type: followupType || undefined,
  };

  const fetchData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const res = await getFollowups(
        { page, page_size: pageSize, ...commonFilters, ...paramsForBucket(bucket) },
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

  const fetchCounts = async (signal?: AbortSignal) => {
    const results = await Promise.all(
      BUCKETS.map((b) =>
        getFollowups({ page: 1, page_size: 1, ...commonFilters, ...paramsForBucket(b) }, signal).then(
          (res) => res.pagination.total,
        ),
      ),
    );
    if (!signal?.aborted) {
      setCounts(Object.fromEntries(BUCKETS.map((b, i) => [b, results[i]])) as Record<ReminderBucket, number>);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCounts(controller.signal).catch(() => {});
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, assignedUserUuid, priority, followupType]);

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <ListPageToolbar
        title={t("followup.reminderWorkspace")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: t("menu.crm.followups"), href: "/app/crm/followups" },
          { label: t("followup.reminderWorkspace") },
        ]}
        secondaryActions={[
          {
            key: "list-view",
            label: t("followup.listView"),
            icon: <ListAltIcon />,
            onClick: () => navigate("/app/crm/followups"),
            show: perms.can_view,
          },
        ]}
      />

      <Paper sx={{ p: 2 }}>
        <Tabs
          value={bucket}
          onChange={(_, v) => updateURL({ bucket: v, page: 1 })}
          sx={{ mb: 2 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {BUCKETS.map((b) => (
            <Tab key={b} value={b} label={`${t(BUCKET_LABEL_KEY[b])} (${counts[b]})`} />
          ))}
        </Tabs>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <EntityAutocomplete
              name="assigned_user_uuid"
              label={t("followup.assignedUser")}
              dropdownName="users"
              useForm={false}
              value={assignedUserUuid || null}
              onChange={(val) => updateURL({ assigned_user_uuid: val || undefined, page: 1 })}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <DropdownAutocomplete
              name="priority"
              dropdownName="followup_priority"
              label={t("followup.priority")}
              value={priority || null}
              onChange={(val: string | null) => updateURL({ priority: val || undefined, page: 1 })}
              useForm={false}
              allowAdd={false}
              pagination={false}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <DropdownAutocomplete
              name="followup_type"
              dropdownName="followup_type"
              label={t("followup.type")}
              value={followupType || null}
              onChange={(val: string | null) => updateURL({ followup_type: val || undefined, page: 1 })}
              useForm={false}
              allowAdd={false}
              pagination={false}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <SearchInput
              placeholder={t("followup.searchPlaceholder")}
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              onSearch={() => updateURL({ search: draftSearch || undefined, page: 1 })}
              onClear={() => {
                setDraftSearch("");
                updateURL({ search: undefined, page: 1 });
              }}
            />
          </Grid>
        </Grid>

        <ReminderWorkspaceTable
          bucket={bucket}
          rows={rows}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={(p) => updateURL({ page: p })}
          onPageSizeChange={(s) => updateURL({ page_size: s, page: 1 })}
          onRefresh={() => {
            fetchData();
            fetchCounts().catch(() => {});
          }}
        />
      </Paper>
    </Box>
  );
}
