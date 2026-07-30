// src/features/settings/documentTemplates/components/DocumentTemplateSettingsForm.tsx
import { useEffect, useMemo } from "react";
import {
  Box,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getDocumentTemplateSettingsSchema } from "../documentTemplateSettings.schema";
import type { DocumentTemplateSettingsUpdate } from "../documentTemplateSettings.types";
import CollapsibleCard from "../../../../components/common/CollapsibleCard";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import FormActions from "../../../../components/forms/FormActions";

const PAPER_SIZES = ["A4", "Letter"] as const;
const ORIENTATIONS = ["Portrait", "Landscape"] as const;
const PAGE_NUMBER_POSITIONS = ["Header", "Footer", "None"] as const;

interface Props {
  defaultValues: DocumentTemplateSettingsUpdate;
  onSubmit: (data: DocumentTemplateSettingsUpdate) => Promise<void>;
  onValuesChange?: (values: DocumentTemplateSettingsUpdate) => void;
}

export default function DocumentTemplateSettingsForm({ defaultValues, onSubmit, onValuesChange }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const schema = useMemo(() => getDocumentTemplateSettingsSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<DocumentTemplateSettingsUpdate>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const liveValues = useWatch({ control });

  useEffect(() => {
    reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues.version_no]);

  useEffect(() => {
    onValuesChange?.(liveValues as DocumentTemplateSettingsUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(liveValues)]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit, () =>
        showSnackbar({ message: t("validation.fixHighlightedFields"), severity: "error" }),
      )}
      noValidate
    >
      <Grid container spacing={2}>
        <CollapsibleCard title={t("documentTemplateConfig.branding")} defaultExpanded>
          {(["show_logo", "show_header_banner", "show_footer_banner"] as const).map((name) => (
            <Grid size={{ xs: 12, sm: 4 }} key={name} sx={{ display: "flex", alignItems: "center" }}>
              <Controller
                name={name}
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label={t(`documentTemplateConfig.${name === "show_logo" ? "showLogo" : name === "show_header_banner" ? "showHeaderBanner" : "showFooterBanner"}`)}
                  />
                )}
              />
            </Grid>
          ))}
        </CollapsibleCard>

        <CollapsibleCard title={t("documentTemplateConfig.layout")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="paper_size"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label={t("documentTemplateConfig.paperSize")}>
                  {PAPER_SIZES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="orientation"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label={t("documentTemplateConfig.orientation")}>
                  {ORIENTATIONS.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              )}
            />
          </Grid>
          {(["margin_top", "margin_bottom", "margin_left", "margin_right"] as const).map((name) => (
            <Grid size={{ xs: 6, sm: 3 }} key={name}>
              <Controller
                name={name}
                control={control}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    type="number"
                    fullWidth
                    label={t(`documentTemplateConfig.${name}`)}
                    helperText={fieldState.error?.message || t("documentTemplateConfig.mmHint")}
                    error={!!fieldState.error}
                  />
                )}
              />
            </Grid>
          ))}
          <Grid size={{ xs: 12, sm: 4 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="show_page_number"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t("documentTemplateConfig.showPageNumber")}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="page_number_position"
              control={control}
              render={({ field }) => (
                <TextField {...field} select fullWidth label={t("documentTemplateConfig.pageNumberPosition")}>
                  {PAGE_NUMBER_POSITIONS.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="show_generated_by"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t("documentTemplateConfig.showGeneratedBy")}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="show_print_date"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t("documentTemplateConfig.showPrintDate")}
                />
              )}
            />
          </Grid>
        </CollapsibleCard>

        <CollapsibleCard title={t("documentTemplateConfig.headerFooter")}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="header_text"
              control={control}
              render={({ field }) => (
                <TextField {...field} value={field.value ?? ""} fullWidth multiline minRows={2} label={t("documentTemplateConfig.headerText")} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="footer_text"
              control={control}
              render={({ field }) => (
                <TextField {...field} value={field.value ?? ""} fullWidth multiline minRows={2} label={t("documentTemplateConfig.footerText")} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="terms_conditions"
              control={control}
              render={({ field }) => (
                <TextField {...field} value={field.value ?? ""} fullWidth multiline minRows={3} label={t("documentTemplateConfig.termsConditions")} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="default_notes"
              control={control}
              render={({ field }) => (
                <TextField {...field} value={field.value ?? ""} fullWidth multiline minRows={2} label={t("documentTemplateConfig.defaultNotes")} />
              )}
            />
          </Grid>
        </CollapsibleCard>

        <CollapsibleCard title={t("documentTemplateConfig.watermark")}>
          <Grid size={{ xs: 12, sm: 4 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="show_watermark"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t("documentTemplateConfig.showWatermark")}
                />
              )}
            />
          </Grid>
        </CollapsibleCard>

        <CollapsibleCard title={t("documentTemplateConfig.signatureStamp")}>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="show_signature"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t("documentTemplateConfig.showSignature")}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="show_stamp"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t("documentTemplateConfig.showStamp")}
                />
              )}
            />
          </Grid>
        </CollapsibleCard>

        <CollapsibleCard title={t("documentTemplateConfig.qrCode")}>
          <Grid size={{ xs: 12 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="show_qr_code"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t("documentTemplateConfig.showQrCode")}
                />
              )}
            />
          </Grid>
        </CollapsibleCard>

        <FormActions onBack={() => navigate("/app/dashboard")} onDiscard={() => reset(defaultValues)} submitting={isSubmitting} />
      </Grid>
    </Box>
  );
}
