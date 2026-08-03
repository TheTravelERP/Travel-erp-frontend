// src/features/inventory/ziyarat/pages/ZiyaratViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Button, Chip, Divider, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getZiyaratByUuid } from "../ziyarat.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

import type { ZiyaratDetail } from "../ziyarat.types";

export default function ZiyaratViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("inventory.ziyarat");

  const [loading, setLoading] = useState(true);
  const [ziyarat, setZiyarat] = useState<ZiyaratDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadZiyarat();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadZiyarat() {
    try {
      const data = await getZiyaratByUuid(uuid!, isTrash);
      setZiyarat(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/inventory/ziyarat");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!ziyarat) {
    return null;
  }

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.inventory.ziyarat"), href: "/app/inventory/ziyarat" },
        { label: t("common.view") },
      ]}
    >
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("common.generalInfo")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("ziyarat.name")}</Typography>
              <Typography mt={0.5}>{ziyarat.name}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("ziyarat.city")}</Typography>
              <Typography mt={0.5}>{ziyarat.city || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("ziyarat.durationHours")}</Typography>
              <Typography mt={0.5}>{ziyarat.duration_hours ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("ziyarat.pickupLocation")}</Typography>
              <Typography mt={0.5}>{ziyarat.pickup_location || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("ziyarat.dropLocation")}</Typography>
              <Typography mt={0.5}>{ziyarat.drop_location || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("ziyarat.defaultCost")}</Typography>
              <Typography mt={0.5}>{ziyarat.default_cost ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("ziyarat.placesCovered")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {ziyarat.places_covered || "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("common.status")}</Typography>
              <Box mt={0.5}>
                <Chip
                  size="small"
                  label={ziyarat.is_active ? t("common.active") : t("common.inactive")}
                  color={ziyarat.is_active ? "success" : "default"}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("ziyarat.description")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {ziyarat.description || "-"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption">{t("ziyarat.remarks")}</Typography>
          <Typography mt={0.5} whiteSpace="pre-wrap">
            {ziyarat.remarks || "-"}
          </Typography>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate("/app/inventory/ziyarat")}
            size="large"
          >
            {t("common.back")}
          </Button>

          <Box display="flex" gap={2}>
            {perms.can_edit && !isTrash && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/app/inventory/ziyarat/${uuid}/edit`)}
              >
                {t("common.edit")}
              </Button>
            )}
          </Box>
        </Box>
    </FormPageLayout>
  );
}
