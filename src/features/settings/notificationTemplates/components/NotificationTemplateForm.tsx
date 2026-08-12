// src/features/settings/notificationTemplates/components/NotificationTemplateForm.tsx

import { useMemo, useRef, useState } from "react";
import { Box, FormControlLabel, Grid, MenuItem, Switch, TextField, Button } from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { getNotificationTemplateSchema } from "../notificationTemplate.schema";
import type { NotificationTemplateFormInput } from "../notificationTemplate.types";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import { useCodeUniquenessCheck } from "../../../../hooks/useCodeUniquenessCheck";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";
import RichTextEditor, { type RichTextEditorHandle } from "./RichTextEditor";
import PlaceholderHelperPanel from "./PlaceholderHelperPanel";
import TemplatePreviewDialog from "./TemplatePreviewDialog";

interface Props {
  defaultValues?: Partial<NotificationTemplateFormInput> & { uuid?: string };
  onSubmit: (data: NotificationTemplateFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues: NotificationTemplateFormInput = {
  template_name: "",
  template_code: "",
  module: "",
  channel: "EMAIL",
  subject: "",
  message_body: "",
  description: "",
  is_active: true,
};

function insertAtCursor(
  el: HTMLInputElement | HTMLTextAreaElement | null,
  currentValue: string,
  text: string,
  onChange: (v: string) => void,
) {
  if (!el) {
    onChange((currentValue || "") + text);
    return;
  }
  const start = el.selectionStart ?? currentValue.length;
  const end = el.selectionEnd ?? currentValue.length;
  const next = currentValue.slice(0, start) + text + currentValue.slice(end);
  onChange(next);
  requestAnimationFrame(() => {
    el.focus();
    el.selectionStart = el.selectionEnd = start + text.length;
  });
}

export default function NotificationTemplateForm({ defaultValues, onSubmit, loading = false }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const schema = useMemo(() => getNotificationTemplateSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = useForm<NotificationTemplateFormInput>({
    resolver: zodResolver(schema) as any,
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  const { onCodeBlur } = useCodeUniquenessCheck<NotificationTemplateFormInput>({
    entity: "notification_template",
    fieldName: "template_code",
    excludeUuid: defaultValues?.uuid,
    setError,
    clearErrors,
    message: t("validation.codeAlreadyExists"),
  });

  const channel = useWatch({ control, name: "channel" });
  const [lastFocusedField, setLastFocusedField] = useState<"subject" | "body">("body");
  const [previewOpen, setPreviewOpen] = useState(false);

  const subjectRef = useRef<HTMLInputElement | null>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const richTextRef = useRef<RichTextEditorHandle>(null);

  function handleInsertPlaceholder(placeholder: string) {
    if (channel === "EMAIL") {
      if (lastFocusedField === "subject") {
        insertAtCursor(subjectRef.current, getValues("subject") || "", placeholder, (v) => setValue("subject", v));
      } else {
        richTextRef.current?.insertText(placeholder);
      }
    } else {
      insertAtCursor(bodyTextareaRef.current, getValues("message_body") || "", placeholder, (v) =>
        setValue("message_body", v, { shouldValidate: true }),
      );
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit, () =>
        showSnackbar({ message: t("validation.fixHighlightedFields"), severity: "error" }),
      )}
      noValidate
    >
      <Grid container spacing={2}>
        <FormSection title={t("notificationTemplate.title")}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="template_code"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  onBlur={(e) => {
                    field.onBlur();
                    onCodeBlur(e.target.value);
                  }}
                  label={t("notificationTemplate.templateCode")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="template_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("notificationTemplate.templateName")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="module"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label={t("notificationTemplate.module")} fullWidth>
                  <MenuItem value="">{t("common.all")}</MenuItem>
                  <MenuItem value="CRM">CRM</MenuItem>
                  <MenuItem value="Booking">{t("notificationTemplate.moduleBooking")}</MenuItem>
                  <MenuItem value="Finance">{t("notificationTemplate.moduleFinance")}</MenuItem>
                  <MenuItem value="System">{t("notificationTemplate.moduleSystem")}</MenuItem>
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <DropdownAutocomplete
              name="channel"
              dropdownName="notification_channel"
              label={t("notificationTemplate.channel")}
              control={control}
              useForm
              allowAdd={false}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t("common.active")}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="description"
              control={control}
              render={({ field }) => <TextField {...field} label={t("notificationTemplate.description")} fullWidth />}
            />
          </Grid>
        </FormSection>

        <FormSection
          title={t("notificationTemplate.messageContent")}
          titleAdornment={
            <Button size="small" startIcon={<VisibilityIcon />} onClick={() => setPreviewOpen(true)} sx={{ ml: "auto" }}>
              {t("notificationTemplate.preview")}
            </Button>
          }
        >
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={2}>
              {channel === "EMAIL" && (
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="subject"
                    control={control}
                    render={({ field, fieldState }) => (
                      <TextField
                        {...field}
                        value={field.value ?? ""}
                        inputRef={(el) => {
                          field.ref(el);
                          subjectRef.current = el;
                        }}
                        onFocus={() => setLastFocusedField("subject")}
                        label={t("notificationTemplate.subject")}
                        fullWidth
                        required
                        error={!!fieldState.error}
                        helperText={fieldState.error?.message}
                      />
                    )}
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <Controller
                  name="message_body"
                  control={control}
                  render={({ field, fieldState }) =>
                    channel === "EMAIL" ? (
                      <Box onFocus={() => setLastFocusedField("body")}>
                        <RichTextEditor ref={richTextRef} value={field.value} onChange={field.onChange} />
                        {fieldState.error && (
                          <Box sx={{ color: "error.main", fontSize: 12, mt: 0.5 }}>{fieldState.error.message}</Box>
                        )}
                      </Box>
                    ) : (
                      <TextField
                        {...field}
                        inputRef={(el) => {
                          field.ref(el);
                          bodyTextareaRef.current = el;
                        }}
                        onFocus={() => setLastFocusedField("body")}
                        label={t("notificationTemplate.messageBody")}
                        fullWidth
                        required
                        multiline
                        minRows={8}
                        error={!!fieldState.error}
                        helperText={
                          fieldState.error?.message ||
                          (channel === "WHATSAPP" ? t("notificationTemplate.whatsappFormattingHelper") : undefined)
                        }
                      />
                    )
                  }
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <PlaceholderHelperPanel onInsert={handleInsertPlaceholder} />
          </Grid>
        </FormSection>

        <FormActions
          onBack={() => navigate("/app/settings/notifications")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>

      <TemplatePreviewDialog
        open={previewOpen}
        channel={channel}
        subject={getValues("subject")}
        messageBody={getValues("message_body") || ""}
        onClose={() => setPreviewOpen(false)}
      />
    </Box>
  );
}
