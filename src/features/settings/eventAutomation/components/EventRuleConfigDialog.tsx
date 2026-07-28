// src/features/settings/eventAutomation/components/EventRuleConfigDialog.tsx

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  MenuItem,
  TextField,
  Divider,
  Typography,
  Autocomplete,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import type { EventRuleItem, EventRuleUpsertPayload } from "../eventAutomation.types";
import { upsertEventRule } from "../eventAutomation.api";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import RecipientsEditor from "./RecipientsEditor";
import ConditionsBuilder from "./ConditionsBuilder";
import { getNotificationTemplates } from "../../notificationTemplates/notificationTemplate.api";
import type { NotificationTemplateListItem } from "../../notificationTemplates/notificationTemplate.types";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

interface Props {
  open: boolean;
  event: EventRuleItem | null;
  onClose: () => void;
  onSaved: (updated: EventRuleItem) => void;
}

export default function EventRuleConfigDialog({ open, event, onClose, onSaved }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<NotificationTemplateListItem[]>([]);
  const [form, setForm] = useState<EventRuleUpsertPayload | null>(null);

  useEffect(() => {
    if (!open || !event) return;
    setForm({
      is_active: event.is_active,
      email_enabled: event.email_enabled,
      whatsapp_enabled: event.whatsapp_enabled,
      sms_enabled: event.sms_enabled,
      trigger_type: event.trigger_type,
      custom_offset_minutes: event.custom_offset_minutes,
      recipients: event.recipients || [],
      email_template_uuid: event.email_template_uuid,
      whatsapp_template_uuid: event.whatsapp_template_uuid,
      sms_template_uuid: event.sms_template_uuid,
      conditions: event.conditions || [],
      version_no: event.version_no,
    });

    (async () => {
      try {
        const res = await getNotificationTemplates({ page: 1, page_size: 100 });
        setTemplates(res.data);
      } catch {
        // Template dropdowns just stay empty — non-fatal for the dialog.
      }
    })();
  }, [open, event]);

  if (!event || !form) return null;

  const templatesByChannel = (channel: string) => templates.filter((tpl) => tpl.channel === channel && tpl.is_active);

  async function handleSave() {
    if (!event || !form) return;
    try {
      setSaving(true);
      const updated = await upsertEventRule(event.event_code, form);
      showSnackbar({ message: t("eventAutomation.saveSuccess"), severity: "success" });
      onSaved(updated);
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("eventAutomation.saveFailed")), severity: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{event.event_name}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
              }
              label={t("common.active")}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider textAlign="left">{t("eventAutomation.channels")}</Divider>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControlLabel
              control={<Switch checked={form.email_enabled} onChange={(e) => setForm({ ...form, email_enabled: e.target.checked })} />}
              label={t("communicationProvider.categoryEmail")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControlLabel
              control={<Switch checked={form.whatsapp_enabled} onChange={(e) => setForm({ ...form, whatsapp_enabled: e.target.checked })} />}
              label={t("communicationProvider.categoryWhatsapp")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControlLabel
              control={<Switch checked={form.sms_enabled} onChange={(e) => setForm({ ...form, sms_enabled: e.target.checked })} />}
              label={t("communicationProvider.categorySms")}
            />
          </Grid>

          {form.email_enabled && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={templatesByChannel("EMAIL")}
                getOptionLabel={(o) => o.template_name}
                value={templatesByChannel("EMAIL").find((tpl) => tpl.uuid === form.email_template_uuid) || null}
                onChange={(_, v) => setForm({ ...form, email_template_uuid: v?.uuid || null })}
                renderInput={(params) => <TextField {...params} label={t("eventAutomation.emailTemplate")} />}
              />
            </Grid>
          )}
          {form.whatsapp_enabled && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={templatesByChannel("WHATSAPP")}
                getOptionLabel={(o) => o.template_name}
                value={templatesByChannel("WHATSAPP").find((tpl) => tpl.uuid === form.whatsapp_template_uuid) || null}
                onChange={(_, v) => setForm({ ...form, whatsapp_template_uuid: v?.uuid || null })}
                renderInput={(params) => <TextField {...params} label={t("eventAutomation.whatsappTemplate")} />}
              />
            </Grid>
          )}
          {form.sms_enabled && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={templatesByChannel("SMS")}
                getOptionLabel={(o) => o.template_name}
                value={templatesByChannel("SMS").find((tpl) => tpl.uuid === form.sms_template_uuid) || null}
                onChange={(_, v) => setForm({ ...form, sms_template_uuid: v?.uuid || null })}
                renderInput={(params) => <TextField {...params} label={t("eventAutomation.smsTemplate")} />}
              />
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Divider textAlign="left">{t("eventAutomation.timing")}</Divider>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DropdownAutocomplete
              name="trigger_type"
              dropdownName="event_trigger_type"
              label={t("eventAutomation.triggerTypeLabel")}
              value={form.trigger_type}
              onChange={(v: string) => setForm({ ...form, trigger_type: (v || "IMMEDIATE") as any })}
              useForm={false}
              allowAdd={false}
            />
          </Grid>
          {form.trigger_type === "CUSTOM_OFFSET" && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                type="number"
                fullWidth
                label={t("eventAutomation.customOffsetMinutes")}
                value={form.custom_offset_minutes ?? ""}
                onChange={(e) => setForm({ ...form, custom_offset_minutes: e.target.value ? Number(e.target.value) : null })}
              />
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Divider textAlign="left">{t("eventAutomation.recipients")}</Divider>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <RecipientsEditor value={form.recipients} onChange={(recipients) => setForm({ ...form, recipients })} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider textAlign="left">{t("eventAutomation.conditions")}</Divider>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ConditionsBuilder value={form.conditions} onChange={(conditions) => setForm({ ...form, conditions })} />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
