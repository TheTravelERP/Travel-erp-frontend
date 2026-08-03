// src/features/package/packageService/pages/PackageServiceViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Button, Chip, Divider, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getPackageServiceByUuid } from "../packageService.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";
import FormPageLayout from "../../../../components/forms/FormPageLayout";
import { useLocalizationProfile } from "../../../../hooks/useLocalizationProfile";
import { formatDateTime, formatNumber } from "../../../../utils/formatters/localization";

import type { PackageServiceDetail } from "../packageService.types";

export default function PackageServiceViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();

  const perms = usePermission("packages.services");

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<PackageServiceDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadPackageService();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadPackageService() {
    try {
      const data = await getPackageServiceByUuid(uuid!, isTrash);
      setService(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/packages/services");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!service) {
    return null;
  }

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.packages.services"), href: "/app/packages/services" },
        { label: t("common.view") },
      ]}
    >
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("menu.packages.services")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t("packageService.package")}</Typography>
              <Typography mt={0.5}>
                {service.package_name || service.package_code
                  ? `${service.package_name || ""} ${service.package_code ? `(${service.package_code})` : ""}`.trim()
                  : service.package_uuid}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("packageService.serviceType")}</Typography>
              <Typography mt={0.5}>{service.service_type}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("common.status")}</Typography>
              <Box mt={0.5}>
                <Chip
                  size="small"
                  label={service.is_active ? t("common.active") : t("common.inactive")}
                  color={service.is_active ? "success" : "default"}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption">{t("packageService.dayNo")}</Typography>
              <Typography mt={0.5}>{service.day_no ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption">{t("packageService.serviceOrder")}</Typography>
              <Typography mt={0.5}>{service.service_order ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t("packageService.description")}</Typography>
              <Typography mt={0.5}>{service.description || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("packageService.scheduleSection")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t("packageService.startDatetime")}</Typography>
              <Typography mt={0.5}>
                {service.start_datetime ? formatDateTime(service.start_datetime, localizationProfile) : "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t("packageService.endDatetime")}</Typography>
              <Typography mt={0.5}>
                {service.end_datetime ? formatDateTime(service.end_datetime, localizationProfile) : "-"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("packageService.pricingSection")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption">{t("packageService.costPrice")}</Typography>
              <Typography mt={0.5}>
                {service.cost_price !== undefined && service.cost_price !== null
                  ? formatNumber(service.cost_price, localizationProfile)
                  : "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption">{t("packageService.sellingPrice")}</Typography>
              <Typography mt={0.5}>
                {service.selling_price !== undefined && service.selling_price !== null
                  ? formatNumber(service.selling_price, localizationProfile)
                  : "-"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("packageService.inventorySection")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t("packageService.inventory")}</Typography>
              <Typography mt={0.5}>
                {service.inventory_name || service.inventory_code
                  ? `${service.inventory_name || ""} ${service.inventory_code ? `(${service.inventory_code})` : ""}`.trim()
                  : service.inventory_uuid || "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("packageService.remarks")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {service.remarks || "-"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate("/app/packages/services")}
            size="large"
          >
            {t("common.back")}
          </Button>

          <Box display="flex" gap={2}>
            {perms.can_edit && !isTrash && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/app/packages/services/${uuid}/edit`)}
              >
                {t("common.edit")}
              </Button>
            )}
          </Box>
        </Box>
    </FormPageLayout>
  );
}
