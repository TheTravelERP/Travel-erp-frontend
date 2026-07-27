// src/features/settings/localizationProfile/pages/LocalizationProfileViewPage.tsx

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getLocalizationProfileByUuid } from "../localizationProfile.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

import type { LocalizationProfileDetail } from "../localizationProfile.types";

export default function LocalizationProfileViewPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.localization_profile");

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<LocalizationProfileDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadProfile();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadProfile() {
    try {
      const data = await getLocalizationProfileByUuid(uuid!);
      setProfile(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });
      navigate("/app/settings/localization-profiles");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!profile) {
    return null;
  }

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.settings.localization_profile"), href: "/app/settings/localization-profiles" },
        { label: t("common.view") },
      ]}
    >
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
          {profile.profile_name}
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("common.country")}</Typography>
            <Typography mt={0.5}>{profile.country_code}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("localizationProfile.defaultCurrency")}</Typography>
            <Typography mt={0.5}>{profile.default_currency_code}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("settings.timezone")}</Typography>
            <Typography mt={0.5}>{profile.timezone}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("localizationProfile.financialYearStartMonth")}</Typography>
            <Typography mt={0.5}>
              {t(`common.months.${profile.financial_year_start_month}`, {
                defaultValue: String(profile.financial_year_start_month),
              })}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("settings.registrationLabel")}</Typography>
            <Typography mt={0.5}>{profile.registration_label}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("settings.dateFormat")}</Typography>
            <Typography mt={0.5}>{profile.date_format}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("settings.timeFormat")}</Typography>
            <Typography mt={0.5}>{profile.time_format}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("localizationProfile.numberFormat")}</Typography>
            <Typography mt={0.5}>{profile.number_format}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("localizationProfile.defaultDecimalPlaces")}</Typography>
            <Typography mt={0.5}>{profile.default_decimal_places}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("localizationProfile.taxCalculationMethod")}</Typography>
            <Typography mt={0.5}>{profile.tax_calculation_method}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("localizationProfile.roundOffMethod")}</Typography>
            <Typography mt={0.5}>{profile.round_off_method}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("common.status")}</Typography>
            <Typography mt={0.5}>
              <Chip
                size="small"
                label={profile.is_active ? t("common.active") : t("common.inactive")}
                color={profile.is_active ? "success" : "default"}
              />
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
          {t("localizationProfile.taxComponents")}
        </Typography>

        {profile.tax_components.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t("localizationProfile.noTaxComponentsYet")}
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("localizationProfile.taxName")}</TableCell>
                  <TableCell>{t("localizationProfile.taxPercent")}</TableCell>
                  <TableCell>{t("localizationProfile.taxType")}</TableCell>
                  <TableCell>{t("localizationProfile.sequence")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {profile.tax_components.map((c: any) => (
                  <TableRow key={c.uuid}>
                    <TableCell>{c.tax_name}</TableCell>
                    <TableCell>{c.tax_percent}%</TableCell>
                    <TableCell>{c.tax_type || "-"}</TableCell>
                    <TableCell>{c.sequence}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button
          variant="outlined"
          onClick={() => navigate("/app/settings/localization-profiles")}
          size="large"
        >
          {t("common.back")}
        </Button>

        <Box display="flex" gap={2}>
          {perms.can_edit && (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(`/app/settings/localization-profiles/${uuid}/edit`)}
            >
              {t("common.edit")}
            </Button>
          )}
        </Box>
      </Box>
    </FormPageLayout>
  );
}
