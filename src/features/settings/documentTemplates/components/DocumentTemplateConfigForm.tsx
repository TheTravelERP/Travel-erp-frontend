// src/features/settings/documentTemplates/components/DocumentTemplateConfigForm.tsx
import {
  Box,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getDocumentTemplateConfigSchema } from "../documentTemplateConfig.schema";
import type { DocumentTemplateConfigFormInput } from "../documentTemplateConfig.types";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import CollapsibleCard from "../../../../components/common/CollapsibleCard";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FormActions from "../../../../components/forms/FormActions";
import NullableBooleanSelect from "./NullableBooleanSelect";

const PAPER_SIZES = ["A4", "Letter"] as const;
const ORIENTATIONS = ["Portrait", "Landscape"] as const;
const PAGE_NUMBER_POSITIONS = ["Header", "Footer", "None"] as const;
const QR_PURPOSES = ["Payment", "Verification", "Website", "DynamicURL"] as const;
const SIGNATURE_POSITIONS = ["Left", "Center", "Right", "Hidden"] as const;

interface Props {
  defaultValues?: Partial<DocumentTemplateConfigFormInput>;
  onSubmit: (data: DocumentTemplateConfigFormInput) => Promise<void>;
  isEdit?: boolean;
}

const emptyValues: DocumentTemplateConfigFormInput = {
  document_type_uuid: "",
  show_logo: null,
  show_header_banner: null,
  show_footer_banner: null,
  show_signature: null,
  show_stamp: null,
  show_qr_code: null,
  show_watermark: null,
  header_text: "",
  footer_text: "",
  terms_conditions: "",
  default_notes: "",
  paper_size: null,
  orientation: null,
  margin_top: null,
  margin_bottom: null,
  margin_left: null,
  margin_right: null,
  show_page_number: null,
  page_number_position: null,
  show_generated_by: null,
  show_print_date: null,
  qr_purpose: null,
  watermark_opacity: null,
  watermark_position: "",
  watermark_scale: null,
  watermark_rotation: null,
  signature_position: null,
  is_active: true,
};

export default function DocumentTemplateConfigForm({ defaultValues, onSubmit, isEdit = false }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const schema = useMemo(() => getDocumentTemplateConfigSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<DocumentTemplateConfigFormInput>({
    resolver: zodResolver(schema),
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  useEffect(() => {
    if (defaultValues) {
      reset(mergeFormDefaults(emptyValues, defaultValues));
    }
  }, [defaultValues, reset]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit, () =>
        showSnackbar({ message: t("validation.fixHighlightedFields"), severity: "error" }),
      )}
      noValidate
    >
      <Grid container spacing={2}>
        <CollapsibleCard title={t("documentTemplateConfig.documentType")} defaultExpanded>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="document_type_uuid"
              label={t("documentTemplateConfig.documentType")}
              control={control}
              dropdownName="document_type"
              disabled={isEdit}
              // document_type is a small, bounded master (~26 rows) — load
              // it in one page so every type is visible without searching.
              pageSize={100}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>
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
        </CollapsibleCard>

        <CollapsibleCard title={t("documentTemplateConfig.branding")}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <NullableBooleanSelect name="show_logo" label={t("documentTemplateConfig.showLogo")} control={control} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <NullableBooleanSelect name="show_header_banner" label={t("documentTemplateConfig.showHeaderBanner")} control={control} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <NullableBooleanSelect name="show_footer_banner" label={t("documentTemplateConfig.showFooterBanner")} control={control} />
          </Grid>
        </CollapsibleCard>

        <CollapsibleCard title={t("documentTemplateConfig.layout")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="paper_size"
              control={control}
              render={({ field }) => (
                <TextField {...field} value={field.value ?? ""} select fullWidth label={t("documentTemplateConfig.paperSize")}>
                  <MenuItem value="">{t("documentTemplateConfig.inheritDefault")}</MenuItem>
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
                <TextField {...field} value={field.value ?? ""} select fullWidth label={t("documentTemplateConfig.orientation")}>
                  <MenuItem value="">{t("documentTemplateConfig.inheritDefault")}</MenuItem>
                  {ORIENTATIONS.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              )}
            />
          </Grid>
          {(["margin_top", "margin_bottom", "margin_left", "margin_right"] as const).map((field_name) => (
            <Grid size={{ xs: 6, sm: 3 }} key={field_name}>
              <Controller
                name={field_name}
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ""}
                    type="number"
                    fullWidth
                    label={t(`documentTemplateConfig.${field_name}`)}
                    helperText={t("documentTemplateConfig.mmHint")}
                  />
                )}
              />
            </Grid>
          ))}
          <Grid size={{ xs: 12, sm: 4 }}>
            <NullableBooleanSelect name="show_page_number" label={t("documentTemplateConfig.showPageNumber")} control={control} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="page_number_position"
              control={control}
              render={({ field }) => (
                <TextField {...field} value={field.value ?? ""} select fullWidth label={t("documentTemplateConfig.pageNumberPosition")}>
                  <MenuItem value="">{t("documentTemplateConfig.inheritDefault")}</MenuItem>
                  {PAGE_NUMBER_POSITIONS.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <NullableBooleanSelect name="show_generated_by" label={t("documentTemplateConfig.showGeneratedBy")} control={control} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <NullableBooleanSelect name="show_print_date" label={t("documentTemplateConfig.showPrintDate")} control={control} />
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
          <Grid size={{ xs: 12, sm: 3 }}>
            <NullableBooleanSelect name="show_watermark" label={t("documentTemplateConfig.showWatermark")} control={control} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="watermark_opacity"
              control={control}
              render={({ field }) => (
                <TextField {...field} value={field.value ?? ""} type="number" fullWidth label={t("documentTemplateConfig.watermarkOpacity")}
                  slotProps={{ htmlInput: { step: 0.05, min: 0, max: 1 } }} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="watermark_scale"
              control={control}
              render={({ field }) => (
                <TextField {...field} value={field.value ?? ""} type="number" fullWidth label={t("documentTemplateConfig.watermarkScale")} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="watermark_rotation"
              control={control}
              render={({ field }) => (
                <TextField {...field} value={field.value ?? ""} type="number" fullWidth label={t("documentTemplateConfig.watermarkRotation")} />
              )}
            />
          </Grid>
        </CollapsibleCard>

        <CollapsibleCard title={t("documentTemplateConfig.signatureStamp")}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <NullableBooleanSelect name="show_signature" label={t("documentTemplateConfig.showSignature")} control={control} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="signature_position"
              control={control}
              render={({ field }) => (
                <TextField {...field} value={field.value ?? ""} select fullWidth label={t("documentTemplateConfig.signaturePosition")}>
                  <MenuItem value="">{t("documentTemplateConfig.inheritDefault")}</MenuItem>
                  {SIGNATURE_POSITIONS.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <NullableBooleanSelect name="show_stamp" label={t("documentTemplateConfig.showStamp")} control={control} />
          </Grid>
        </CollapsibleCard>

        <CollapsibleCard title={t("documentTemplateConfig.qrCode")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <NullableBooleanSelect name="show_qr_code" label={t("documentTemplateConfig.showQrCode")} control={control} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="qr_purpose"
              control={control}
              render={({ field }) => (
                <TextField {...field} value={field.value ?? ""} select fullWidth label={t("documentTemplateConfig.qrPurpose")}>
                  <MenuItem value="">{t("documentTemplateConfig.inheritDefault")}</MenuItem>
                  {QR_PURPOSES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </TextField>
              )}
            />
          </Grid>
        </CollapsibleCard>

        <FormActions
          onBack={() => navigate("/app/settings/document-templates/config")}
          onDiscard={() => reset()}
          submitting={isSubmitting}
        />
      </Grid>
    </Box>
  );
}
