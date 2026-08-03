// src/features/inventory/airline/pages/AirlineViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Button, Chip, Divider, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getAirlineByUuid } from "../airline.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

import type { AirlineDetail } from "../airline.types";

export default function AirlineViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("inventory.airlines");

  const [loading, setLoading] = useState(true);
  const [airline, setAirline] = useState<AirlineDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadAirline();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadAirline() {
    try {
      const data = await getAirlineByUuid(uuid!, isTrash);
      setAirline(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/inventory/airlines");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!airline) {
    return null;
  }

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.inventory.airlines"), href: "/app/inventory/airlines" },
        { label: t("common.view") },
      ]}
    >
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("common.generalInfo")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("airline.code")}</Typography>
              <Typography mt={0.5}>{airline.airline_code}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("airline.name")}</Typography>
              <Typography mt={0.5}>{airline.airline_name}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("airline.icaoCode")}</Typography>
              <Typography mt={0.5}>{airline.icao_code || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("airline.country")}</Typography>
              <Typography mt={0.5}>{airline.country || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("airline.phone")}</Typography>
              <Typography mt={0.5}>{airline.phone || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("airline.email")}</Typography>
              <Typography mt={0.5}>{airline.email || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("airline.website")}</Typography>
              <Typography mt={0.5}>{airline.website || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("common.status")}</Typography>
              <Box mt={0.5}>
                <Chip
                  size="small"
                  label={airline.is_active ? t("common.active") : t("common.inactive")}
                  color={airline.is_active ? "success" : "default"}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption" display="block" mb={0.5}>
                {t("airline.logo")}
              </Typography>
              {airline.logo ? (
                <Box
                  component="img"
                  src={airline.logo}
                  alt={airline.airline_name}
                  sx={{ maxWidth: 140, maxHeight: 64, objectFit: "contain" }}
                />
              ) : (
                <Typography mt={0.5}>-</Typography>
              )}
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption">{t("airline.remarks")}</Typography>
          <Typography mt={0.5} whiteSpace="pre-wrap">
            {airline.remarks || "-"}
          </Typography>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate("/app/inventory/airlines")}
            size="large"
          >
            {t("common.back")}
          </Button>

          <Box display="flex" gap={2}>
            {perms.can_edit && !isTrash && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/app/inventory/airlines/${uuid}/edit`)}
              >
                {t("common.edit")}
              </Button>
            )}
          </Box>
        </Box>
    </FormPageLayout>
  );
}
