// src/features/settings/termsCondition/pages/TermsConditionViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getTermsConditionByUuid } from "../termsCondition.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";
import FormPageLayout from "../../../../components/forms/FormPageLayout";
import { useLocalizationProfile } from "../../../../hooks/useLocalizationProfile";
import { formatDate } from "../../../../utils/formatters/localization";

import type { TermsConditionDetail } from "../termsCondition.types";

export default function TermsConditionViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();

  const perms = usePermission("settings.terms_conditions_master");

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<TermsConditionDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadTermsCondition();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadTermsCondition() {
    try {
      const data = await getTermsConditionByUuid(uuid!, isTrash);
      setRecord(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/settings/terms-conditions-master");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!record) {
    return null;
  }

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.settings.terms_conditions_master"), href: "/app/settings/terms-conditions-master" },
        { label: t("common.view") },
      ]}
    >
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("termsConditions.title")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("termsConditions.code")}</Typography>
              <Typography mt={0.5}>{record.code || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("termsConditions.titleField")}</Typography>
              <Typography mt={0.5}>{record.title}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("termsConditions.documentType")}</Typography>
              <Typography mt={0.5}>
                {record.document_type_name} {record.document_type_code ? `(${record.document_type_code})` : ""}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("termsConditions.isDefault")}</Typography>
              <Typography mt={0.5}>
                {record.is_default ? (
                  <Chip size="small" label={t("common.yes")} color="primary" />
                ) : (
                  t("common.no")
                )}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("common.status")}</Typography>
              <Typography mt={0.5}>
                <Chip
                  size="small"
                  label={record.is_active ? t("common.active") : t("common.inactive")}
                  color={record.is_active ? "success" : "default"}
                />
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("common.createdOn")}</Typography>
              <Typography mt={0.5}>
                {record.created_at ? formatDate(record.created_at, localizationProfile) : "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("termsConditions.termsText")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {record.terms_text}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("termsConditions.remarks")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {record.remarks || "-"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate("/app/settings/terms-conditions-master")}
            size="large"
          >
            {t("common.back")}
          </Button>

          <Box display="flex" gap={2}>
            {perms.can_edit && !isTrash && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/app/settings/terms-conditions-master/${uuid}/edit`)}
              >
                {t("common.edit")}
              </Button>
            )}
          </Box>
        </Box>
    </FormPageLayout>
  );
}
