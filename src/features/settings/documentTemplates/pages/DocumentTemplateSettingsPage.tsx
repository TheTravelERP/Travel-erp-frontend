// src/features/settings/documentTemplates/pages/DocumentTemplateSettingsPage.tsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Box, CircularProgress, Grid, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import DocumentTemplateSettingsForm from "../components/DocumentTemplateSettingsForm";
import DocumentPreviewPanel from "../components/DocumentPreviewPanel";
import {
  fetchDocumentTemplateSettings,
  previewDocumentTemplateSettings,
  updateDocumentTemplateSettings,
} from "../documentTemplateSettings.api";
import type { DocumentTemplateSettings, DocumentTemplateSettingsUpdate } from "../documentTemplateSettings.types";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

export default function DocumentTemplateSettingsPage() {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const perms = usePermission("settings.document_templates");

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<DocumentTemplateSettings | null>(null);
  const [liveValues, setLiveValues] = useState<DocumentTemplateSettingsUpdate | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchDocumentTemplateSettings(controller.signal)
      .then(setSettings)
      .catch((err) => {
        if (!axios.isCancel(err)) {
          showSnackbar({ message: t("common.loadFailed"), severity: "error" });
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(data: DocumentTemplateSettingsUpdate) {
    try {
      const updated = await updateDocumentTemplateSettings(data);
      setSettings(updated);
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
    } catch (err: any) {
      if (err?.response?.status === 409) {
        showSnackbar({ message: getErrorMessage(err, t("common.updateConflict")), severity: "error" });
        return;
      }
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    }
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {t("menu.settings.document_templates")}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        {t("menu.dashboard")} &bull; {t("menu.settings")} &bull; {t("menu.settings.document_templates")}
      </Typography>

      {loading || !settings ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <DocumentTemplateSettingsForm
              defaultValues={settings}
              onSubmit={handleSave}
              onValuesChange={setLiveValues}
            />
          </Grid>

          {perms.can_export && (
            <Grid size={{ xs: 12, lg: 5 }}>
              <Paper sx={{ p: 2, position: { lg: "sticky" }, top: { lg: 16 } }}>
                <DocumentPreviewPanel
                  values={liveValues ?? settings}
                  fetchPreview={(values) => previewDocumentTemplateSettings(values)}
                  enabled={!!liveValues}
                />
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}
