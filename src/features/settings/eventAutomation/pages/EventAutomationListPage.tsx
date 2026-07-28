// src/features/settings/eventAutomation/pages/EventAutomationListPage.tsx

import { useEffect, useState } from "react";
import { Box, Paper, MenuItem, TextField, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";

import ListPageToolbar from "../../../../components/common/ListPageToolbar";
import { SearchInput } from "../../../../components/ui/SearchInput";
import EventAutomationTable from "../components/EventAutomationTable";
import EventRuleConfigDialog from "../components/EventRuleConfigDialog";
import { getEventRules, upsertEventRule } from "../eventAutomation.api";
import type { EventRuleItem } from "../eventAutomation.types";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

export default function EventAutomationListPage() {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const [rows, setRows] = useState<EventRuleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [configureEvent, setConfigureEvent] = useState<EventRuleItem | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await getEventRules();
      setRows(res.data);
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.loadFailed")), severity: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moduleGroups = Array.from(new Set(rows.map((r) => r.module_group)));

  const filteredRows = rows.filter((r) => {
    if (moduleFilter && r.module_group !== moduleFilter) return false;
    if (search && !r.event_name.toLowerCase().includes(search.toLowerCase()) && !r.event_code.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  async function handleToggleActive(row: EventRuleItem, active: boolean) {
    try {
      const updated = await upsertEventRule(row.event_code, {
        is_active: active,
        email_enabled: row.email_enabled,
        whatsapp_enabled: row.whatsapp_enabled,
        sms_enabled: row.sms_enabled,
        trigger_type: row.trigger_type,
        custom_offset_minutes: row.custom_offset_minutes,
        recipients: row.recipients,
        email_template_uuid: row.email_template_uuid,
        whatsapp_template_uuid: row.whatsapp_template_uuid,
        sms_template_uuid: row.sms_template_uuid,
        conditions: row.conditions,
        version_no: row.version_no,
      });
      setRows((prev) => prev.map((r) => (r.event_code === updated.event_code ? updated : r)));
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    }
  }

  function handleSaved(updated: EventRuleItem) {
    setRows((prev) => prev.map((r) => (r.event_code === updated.event_code ? updated : r)));
    setConfigureEvent(null);
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <ListPageToolbar
        title={t("menu.settings.event_automation")}
        breadcrumbs={[
          { label: t("menu.dashboard"), href: "/app/dashboard" },
          { label: t("menu.settings.event_automation") },
        ]}
      />

      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
          <SearchInput
            placeholder={t("common.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={() => {}}
            onClear={() => setSearch("")}
            sx={{ flex: 1 }}
          />
          <TextField
            select
            size="small"
            sx={{ minWidth: 180 }}
            label={t("notificationTemplate.module")}
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
          >
            <MenuItem value="">{t("common.all")}</MenuItem>
            {moduleGroups.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <EventAutomationTable
          rows={loading ? [] : filteredRows}
          onToggleActive={handleToggleActive}
          onConfigure={setConfigureEvent}
        />
      </Paper>

      <EventRuleConfigDialog
        open={Boolean(configureEvent)}
        event={configureEvent}
        onClose={() => setConfigureEvent(null)}
        onSaved={handleSaved}
      />
    </Box>
  );
}
