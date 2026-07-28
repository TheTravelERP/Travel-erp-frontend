// src/features/settings/auditLog/pages/AuditLogListPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Grid, MenuItem, Paper, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

import ListPageToolbar from "../../../../components/common/ListPageToolbar";
import AuditLogTable from "../components/AuditLogTable";
import AuditLogDetailDialog from "../components/AuditLogDetailDialog";

import { usePermission } from "../../../../hooks/usePermission";
import { getAuditLogEntityTypes, getAuditLogs } from "../auditLog.api";
import { AUDIT_LOG_ACTIONS, type AuditLogListItem } from "../auditLog.types";

export default function AuditLogListPage() {
  const { t } = useTranslation();
  const perms = usePermission("settings.audit_log");
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("page_size") || 20);

  const entityTypeFilter = searchParams.get("entity_type") || "";
  const actionFilter = searchParams.get("action") || "";
  const fromDate = searchParams.get("from_date") || "";
  const toDate = searchParams.get("to_date") || "";

  const [draftFromDate, setDraftFromDate] = useState(fromDate);
  const [draftToDate, setDraftToDate] = useState(toDate);

  const [rows, setRows] = useState<AuditLogListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
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

      const res = await getAuditLogs(
        {
          page,
          page_size: pageSize,
          entity_type: entityTypeFilter || undefined,
          action: actionFilter || undefined,
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
    getAuditLogEntityTypes().then(setEntityTypes);
  }, []);

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <ListPageToolbar
        title={t("menu.settings.audit_log")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: t("menu.settings.audit_log") },
        ]}
      />

      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("auditLog.filterEntityType")}
              value={entityTypeFilter}
              onChange={(e) => updateURL({ entity_type: e.target.value || undefined, page: 1 })}
            >
              <MenuItem value="">{t("common.all")}</MenuItem>
              {entityTypes.map((et) => (
                <MenuItem key={et} value={et}>
                  {et}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("auditLog.filterAction")}
              value={actionFilter}
              onChange={(e) => updateURL({ action: e.target.value || undefined, page: 1 })}
            >
              <MenuItem value="">{t("common.all")}</MenuItem>
              {AUDIT_LOG_ACTIONS.map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 6, sm: 3, md: 3 }}>
            <TextField
              fullWidth
              size="small"
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
              size="small"
              type="date"
              label={t("common.toDate")}
              InputLabelProps={{ shrink: true }}
              value={draftToDate}
              onChange={(e) => setDraftToDate(e.target.value)}
              onBlur={() => updateURL({ to_date: draftToDate || undefined, page: 1 })}
            />
          </Grid>
        </Grid>

        <AuditLogTable
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

      <AuditLogDetailDialog uuid={perms.can_view ? detailUuid : null} onClose={() => setDetailUuid(null)} />
    </Box>
  );
}
