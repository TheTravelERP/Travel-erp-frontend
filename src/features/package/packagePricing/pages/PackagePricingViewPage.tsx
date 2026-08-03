// src/features/package/packagePricing/pages/PackagePricingViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Button, Chip, Divider, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getPackagePricingByUuid } from "../packagePricing.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";
import FormPageLayout from "../../../../components/forms/FormPageLayout";
import { useLocalizationProfile } from "../../../../hooks/useLocalizationProfile";
import { formatDate, formatNumber } from "../../../../utils/formatters/localization";

import type { PackagePricingDetail } from "../packagePricing.types";

export default function PackagePricingViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();

  const perms = usePermission("packages.pricing");

  const [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState<PackagePricingDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadPackagePricing();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadPackagePricing() {
    try {
      const data = await getPackagePricingByUuid(uuid!, isTrash);
      setPricing(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/packages/pricing");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!pricing) {
    return null;
  }

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.packages.pricing"), href: "/app/packages/pricing" },
        { label: t("common.view") },
      ]}
    >
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("menu.packages.pricing")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t("packagePricing.package")}</Typography>
              <Typography mt={0.5}>
                {pricing.package_name || pricing.package_code
                  ? `${pricing.package_name || ""} ${pricing.package_code ? `(${pricing.package_code})` : ""}`.trim()
                  : pricing.package_uuid}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("common.status")}</Typography>
              <Box mt={0.5}>
                <Chip
                  size="small"
                  label={pricing.is_active ? t("common.active") : t("common.inactive")}
                  color={pricing.is_active ? "success" : "default"}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("packagePricing.isDefault")}</Typography>
              <Typography mt={0.5}>{pricing.is_default ? t("common.active") : t("common.inactive")}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("packagePricing.occupancyType")}</Typography>
              <Typography mt={0.5}>{pricing.occupancy_type}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("packagePricing.passengerType")}</Typography>
              <Typography mt={0.5}>{pricing.passenger_type}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("packagePricing.priceCategory")}</Typography>
              <Typography mt={0.5}>{pricing.price_category || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("packagePricing.currencyCode")}</Typography>
              <Typography mt={0.5}>{pricing.currency_code}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("packagePricing.price")}</Typography>
              <Typography mt={0.5} fontWeight={600}>{formatNumber(pricing.price, localizationProfile)}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }} />

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("packagePricing.effectiveFrom")}</Typography>
              <Typography mt={0.5}>{formatDate(pricing.effective_from, localizationProfile)}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("packagePricing.effectiveTo")}</Typography>
              <Typography mt={0.5}>{pricing.effective_to ? formatDate(pricing.effective_to, localizationProfile) : "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate("/app/packages/pricing")}
            size="large"
          >
            {t("common.back")}
          </Button>

          <Box display="flex" gap={2}>
            {perms.can_edit && !isTrash && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/app/packages/pricing/${uuid}/edit`)}
              >
                {t("common.edit")}
              </Button>
            )}
          </Box>
        </Box>
    </FormPageLayout>
  );
}
