// src/features/settings/taxCode/pages/TaxCodeViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Button, Chip, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getTaxCodeByUuid } from "../taxCode.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

import type { TaxCodeDetail } from "../taxCode.types";

export default function TaxCodeViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.tax_code_master");

  const [loading, setLoading] = useState(true);
  const [taxCode, setTaxCode] = useState<TaxCodeDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadTaxCode();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadTaxCode() {
    try {
      const data = await getTaxCodeByUuid(uuid!, isTrash);
      setTaxCode(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/settings/tax-code-master");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!taxCode) {
    return null;
  }

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.settings.tax_code_master"), href: "/app/settings/tax-code-master" },
        { label: t("common.view") },
      ]}
    >
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
          {t("taxCode.title")}
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption">{t("common.code")}</Typography>
            <Typography mt={0.5}>{taxCode.code}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="caption">{t("common.name")}</Typography>
            <Typography mt={0.5}>{taxCode.name}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("common.active")}</Typography>
            <Box mt={0.5}>
              <Chip
                size="small"
                label={taxCode.is_active ? t("common.active") : t("common.inactive")}
                color={taxCode.is_active ? "success" : "default"}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption">{t("taxCode.rate")}</Typography>
            <Typography mt={0.5}>{taxCode.rate}%</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption">{t("taxCode.taxType")}</Typography>
            <Typography mt={0.5}>{taxCode.tax_type || "-"}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button
          variant="outlined"
          onClick={() => navigate("/app/settings/tax-code-master")}
          size="large"
        >
          {t("common.back")}
        </Button>

        <Box display="flex" gap={2}>
          {perms.can_edit && !isTrash && (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(`/app/settings/tax-code-master/${uuid}/edit`)}
            >
              {t("common.edit")}
            </Button>
          )}
        </Box>
      </Box>
    </FormPageLayout>
  );
}
