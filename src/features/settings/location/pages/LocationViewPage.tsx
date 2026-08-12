// src/features/settings/location/pages/LocationViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Button, Chip, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getLocationByUuid } from "../location.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

import type { LocationDetail } from "../location.types";

export default function LocationViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.location_master");

  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<LocationDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadLocation();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadLocation() {
    try {
      const data = await getLocationByUuid(uuid!, isTrash);
      setLocation(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/settings/location-master");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!location) {
    return null;
  }

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.settings.location_master"), href: "/app/settings/location-master" },
        { label: t("common.view") },
      ]}
    >
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
          {t("location.title")}
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption">{t("common.code")}</Typography>
            <Typography mt={0.5}>{location.code}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="caption">{t("common.name")}</Typography>
            <Typography mt={0.5}>{location.name}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("common.active")}</Typography>
            <Box mt={0.5}>
              <Chip
                size="small"
                label={location.is_active ? t("common.active") : t("common.inactive")}
                color={location.is_active ? "success" : "default"}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption">{t("common.country")}</Typography>
            <Typography mt={0.5}>{location.country_name || location.country_code || "-"}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption">{t("location.stateProvince")}</Typography>
            <Typography mt={0.5}>{location.city_name || location.city_code || "-"}</Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="caption">{t("location.remarks")}</Typography>
            <Typography mt={0.5} whiteSpace="pre-wrap">
              {location.remarks || "-"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button
          variant="outlined"
          onClick={() => navigate("/app/settings/location-master")}
          size="large"
        >
          {t("common.back")}
        </Button>

        <Box display="flex" gap={2}>
          {perms.can_edit && !isTrash && (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(`/app/settings/location-master/${uuid}/edit`)}
            >
              {t("common.edit")}
            </Button>
          )}
        </Box>
      </Box>
    </FormPageLayout>
  );
}
