// src/features/reports/notificationLogs/pages/NotificationLogListPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Grid, MenuItem, Paper, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import DownloadIcon from "@mui/icons-material/Download";

import ListPageToolbar from "../../../../components/common/ListPageToolbar";
import { SearchInput } from "../../../../components/ui/SearchInput";
import NotificationLogTable from "../components/NotificationLogTable";
import NotificationLogDetailDialog from "../components/NotificationLogDetailDialog";

import { usePermission } from "../../../../hooks/usePermission";
import { getNotificationLogProviders, getNotificationLogs } from "../notificationLog.api";
import type { NotificationLogListItem } from "../notificationLog.types";

const STATUS_OPTIONS = ["PENDING", "PROCESSING", "SENT", "FAILED", "CANCELLED", "RETRY"];

export default function NotificationLogListPage() {
  const { t } = useTranslation();
  const perms = usePermission("reports.notification_logs");
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("page_size") || 20);

  const search = searchParams.get("search") || "";
  const moduleFilter = searchParams.get("module_group") || "";
  const channelFilter = searchParams.get("channel") || "";
  const providerFilter = searchParams.get("provider_name") || "";
  const statusFilter = searchParams.get("status") || "";
  const fromDate = searchParams.get("from_date") || "";
  const toDate = searchParams.get("to_date") || "";

  const [draftSearch, setDraftSearch] = useState(search);
  const [draftFromDate, setDraftFromDate] = useState(fromDate);
  const [draftToDate, setDraftToDate] = useState(toDate);

  const [rows, setRows] = useState<NotificationLogListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<string[]>([]);
  const [detailUuid, setDetailUuid] = useState<string | null>(null);

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
      const res = await getNotificationLogs(
        {
          page,
          page_size: pageSize,
          search: search || undefined,
          module_group: moduleFilter || undefined,
          channel: (channelFilter as any) || undefined,
          provider_name: providerFilter || undefined,
          status: (statusFilter as any) || undefined,
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

  useEffect(() => {
    getNotificationLogProviders().then(setProviders);
  }, []);

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const params = new URLSearchParams(searchParams);
    params.set("format", format);
    window.open(`${import.meta.env.VITE_API_BASE_URL}/api/v1/notification-logs/export?${params}`, "_blank");
  };

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <ListPageToolbar
        title={t("menu.reports.notification_logs")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: t("menu.reports.notification_logs") },
        ]}
        secondaryActions={[
          {
            key: "export",
            label: t("common.export"),
            icon: <DownloadIcon />,
            show: perms.can_export,
            menuItems: [
              { label: t("common.exportCsv"), onClick: () => handleExport("csv") },
              { label: t("common.exportExcel"), onClick: () => handleExport("excel") },
              { label: t("common.exportPdf"), onClick: () => handleExport("pdf") },
            ],
          },
        ]}
      />

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              label={t("notificationTemplate.module")}
              value={moduleFilter}
              onChange={(e) => updateURL({ module_group: e.target.value || undefined, page: 1 })}
            >
              <MenuItem value="">{t("common.all")}</MenuItem>
              <MenuItem value="CRM">CRM</MenuItem>
              <MenuItem value="Booking">{t("notificationTemplate.moduleBooking")}</MenuItem>
              <MenuItem value="Finance">{t("notificationTemplate.moduleFinance")}</MenuItem>
              <MenuItem value="System">{t("notificationTemplate.moduleSystem")}</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              label={t("notificationTemplate.channel")}
              value={channelFilter}
              onChange={(e) => updateURL({ channel: e.target.value || undefined, page: 1 })}
            >
              <MenuItem value="">{t("common.all")}</MenuItem>
              <MenuItem value="EMAIL">{t("communicationProvider.categoryEmail")}</MenuItem>
              <MenuItem value="WHATSAPP">{t("communicationProvider.categoryWhatsapp")}</MenuItem>
              <MenuItem value="SMS">{t("communicationProvider.categorySms")}</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField
              select
              fullWidth
              label={t("notificationLog.colProvider")}
              value={providerFilter}
              onChange={(e) => updateURL({ provider_name: e.target.value || undefined, page: 1 })}
            >
              <MenuItem value="">{t("common.all")}</MenuItem>
              {providers.map((p) => (
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
              label={t("notificationLog.colStatus")}
              value={statusFilter}
              onChange={(e) => updateURL({ status: e.target.value || undefined, page: 1 })}
            >
              <MenuItem value="">{t("common.all")}</MenuItem>
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 3 }}>
            <TextField
              fullWidth
              type="date"
              label={t("common.fromDate")}
              InputLabelProps={{ shrink: true }}
              value={draftFromDate}
              onChange={(e) => setDraftFromDate(e.target.value)}
              onBlur={() => updateURL({ from_date: draftFromDate || undefined, page: 1 })}
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 3 }}>
            <TextField
              fullWidth
              type="date"
              label={t("common.toDate")}
              InputLabelProps={{ shrink: true }}
              value={draftToDate}
              onChange={(e) => setDraftToDate(e.target.value)}
              onBlur={() => updateURL({ to_date: draftToDate || undefined, page: 1 })}
            />
          </Grid>
        </Grid>

        <SearchInput
          placeholder={t("notificationLog.searchPlaceholder")}
          value={draftSearch}
          onChange={(e) => setDraftSearch(e.target.value)}
          onSearch={() => updateURL({ search: draftSearch || undefined, page: 1 })}
          onClear={() => {
            setDraftSearch("");
            updateURL({ search: undefined, page: 1 });
          }}
          sx={{ mb: 2 }}
        />

        <NotificationLogTable
          rows={rows}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={(p) => updateURL({ page: p })}
          onPageSizeChange={(s) => updateURL({ page_size: s, page: 1 })}
          onViewDetail={setDetailUuid}
        />
      </Paper>

      <NotificationLogDetailDialog uuid={perms.can_view ? detailUuid : null} onClose={() => setDetailUuid(null)} />
    </Box>
  );
}
