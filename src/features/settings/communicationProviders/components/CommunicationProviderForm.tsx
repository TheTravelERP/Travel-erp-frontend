// src/features/settings/communicationProviders/components/CommunicationProviderForm.tsx

import { useMemo } from "react";
import {
  Box,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getCommunicationProviderSchema } from "../communicationProvider.schema";
import type { CommunicationProviderDetail, CommunicationProviderFormInput, ProviderCategory } from "../communicationProvider.types";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

interface CommunicationProviderFormProps {
  defaultValues?: Partial<CommunicationProviderFormInput>;
  existing?: CommunicationProviderDetail;
  onSubmit: (data: CommunicationProviderFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues: CommunicationProviderFormInput = {
  provider_category: "EMAIL",
  provider_type: "",
  provider_name: "",
  is_default: false,
  is_active: true,
  from_name: "",
  from_email: "",
  reply_to: "",
  smtp_host: "",
  smtp_port: undefined,
  smtp_username: "",
  smtp_password: "",
  encryption_type: "TLS",
  phone_number_id: "",
  business_account_id: "",
  access_token: "",
  webhook_verify_token: "",
  api_key: "",
  secret_key: "",
  sender_id: "",
};

const PROVIDER_TYPE_DROPDOWN: Record<ProviderCategory, string> = {
  EMAIL: "email_provider_type",
  WHATSAPP: "whatsapp_provider_type",
  SMS: "sms_provider_type",
};

/** A secret field that, on edit, shows a "configured" placeholder instead of
 * the (never-returned) plaintext value — submitting blank means "keep the
 * currently stored credential unchanged". */
function SecretField({
  name,
  control,
  label,
  configured,
}: {
  name: keyof CommunicationProviderFormInput;
  control: any;
  label: string;
  configured?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Controller
      name={name as any}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          value={field.value ?? ""}
          type="password"
          label={label}
          fullWidth
          error={!!fieldState.error}
          helperText={
            fieldState.error?.message ||
            (configured ? t("communicationProvider.secretConfiguredHelper") : undefined)
          }
          placeholder={configured ? "••••••••" : undefined}
        />
      )}
    />
  );
}

export default function CommunicationProviderForm({
  defaultValues,
  existing,
  onSubmit,
  loading = false,
}: CommunicationProviderFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const schema = useMemo(() => getCommunicationProviderSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CommunicationProviderFormInput>({
    resolver: zodResolver(schema) as any,
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  const category = useWatch({ control, name: "provider_category" }) as ProviderCategory;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit, () =>
        showSnackbar({ message: t("validation.fixHighlightedFields"), severity: "error" }),
      )}
      noValidate
    >
      <Grid container spacing={2}>
        <FormSection title={t("communicationProvider.title")}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="provider_category"
              control={control}
              render={({ field }) => (
                <ToggleButtonGroup
                  {...field}
                  exclusive
                  disabled={!!existing}
                  onChange={(_, value) => value && field.onChange(value)}
                  size="small"
                >
                  <ToggleButton value="EMAIL">{t("communicationProvider.categoryEmail")}</ToggleButton>
                  <ToggleButton value="WHATSAPP">{t("communicationProvider.categoryWhatsapp")}</ToggleButton>
                  <ToggleButton value="SMS">{t("communicationProvider.categorySms")}</ToggleButton>
                </ToggleButtonGroup>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <DropdownAutocomplete
              key={category}
              name="provider_type"
              dropdownName={PROVIDER_TYPE_DROPDOWN[category] || "email_provider_type"}
              label={t("communicationProvider.providerType")}
              control={control}
              useForm
              allowAdd={false}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="provider_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("communicationProvider.providerName")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }} sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Controller
              name="is_default"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t("communicationProvider.isDefault")}
                />
              )}
            />
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
        </FormSection>

        {category === "EMAIL" && (
          <FormSection title={t("communicationProvider.emailSectionTitle")}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="from_name"
                control={control}
                render={({ field }) => <TextField {...field} label={t("communicationProvider.fromName")} fullWidth />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="from_email"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t("communicationProvider.fromEmail")}
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
                name="reply_to"
                control={control}
                render={({ field }) => <TextField {...field} label={t("communicationProvider.replyTo")} fullWidth />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="smtp_host"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t("communicationProvider.smtpHost")}
                    fullWidth
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 2 }}>
              <Controller
                name="smtp_port"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    type="number"
                    label={t("communicationProvider.smtpPort")}
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <DropdownAutocomplete
                name="encryption_type"
                dropdownName="email_encryption_type"
                label={t("communicationProvider.encryptionType")}
                control={control}
                useForm
                allowAdd={false}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <Controller
                name="smtp_username"
                control={control}
                render={({ field }) => <TextField {...field} label={t("communicationProvider.smtpUsername")} fullWidth />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <SecretField
                name="smtp_password"
                control={control}
                label={t("communicationProvider.smtpPassword")}
                configured={existing?.has_smtp_password}
              />
            </Grid>
          </FormSection>
        )}

        {category === "WHATSAPP" && (
          <FormSection title={t("communicationProvider.whatsappSectionTitle")}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="phone_number_id"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t("communicationProvider.phoneNumberId")}
                    fullWidth
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Controller
                name="business_account_id"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label={t("communicationProvider.businessAccountId")} fullWidth />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretField
                name="access_token"
                control={control}
                label={t("communicationProvider.accessToken")}
                configured={existing?.has_access_token}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SecretField
                name="webhook_verify_token"
                control={control}
                label={t("communicationProvider.webhookVerifyToken")}
                configured={existing?.has_webhook_verify_token}
              />
            </Grid>
          </FormSection>
        )}

        {category === "SMS" && (
          <FormSection title={t("communicationProvider.smsSectionTitle")}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <SecretField
                name="api_key"
                control={control}
                label={t("communicationProvider.apiKey")}
                configured={existing?.has_api_key}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <SecretField
                name="secret_key"
                control={control}
                label={t("communicationProvider.secretKey")}
                configured={existing?.has_secret_key}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="sender_id"
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label={t("communicationProvider.senderId")}
                    fullWidth
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
          </FormSection>
        )}

        <FormActions
          onBack={() => navigate("/app/settings/communication-settings")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
