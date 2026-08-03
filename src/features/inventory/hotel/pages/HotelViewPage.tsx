// src/features/inventory/hotel/pages/HotelViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Button, Chip, Divider, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getHotelByUuid } from "../hotel.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

import type { HotelDetail } from "../hotel.types";

export default function HotelViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("inventory.hotels");

  const [loading, setLoading] = useState(true);
  const [hotel, setHotel] = useState<HotelDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadHotel();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadHotel() {
    try {
      const data = await getHotelByUuid(uuid!, isTrash);
      setHotel(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/inventory/hotels");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!hotel) {
    return null;
  }

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.inventory.hotels"), href: "/app/inventory/hotels" },
        { label: t("common.view") },
      ]}
    >
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("hotel.basicInfo")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("hotel.code")}</Typography>
              <Typography mt={0.5}>{hotel.hotel_code}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("hotel.name")}</Typography>
              <Typography mt={0.5}>{hotel.hotel_name}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("hotel.group")}</Typography>
              <Typography mt={0.5}>{hotel.hotel_group || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("hotel.starRating")}</Typography>
              <Typography mt={0.5}>{hotel.star_rating ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("hotel.contactPerson")}</Typography>
              <Typography mt={0.5}>{hotel.contact_person || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("hotel.checkInTime")}</Typography>
              <Typography mt={0.5}>{hotel.check_in_time || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("hotel.checkOutTime")}</Typography>
              <Typography mt={0.5}>{hotel.check_out_time || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("common.status")}</Typography>
              <Box mt={0.5}>
                <Chip
                  size="small"
                  label={hotel.is_active ? t("common.active") : t("common.inactive")}
                  color={hotel.is_active ? "success" : "default"}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("hotel.locationSection")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("hotel.city")}</Typography>
              <Typography mt={0.5}>{hotel.city || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("hotel.state")}</Typography>
              <Typography mt={0.5}>{hotel.state || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("hotel.country")}</Typography>
              <Typography mt={0.5}>{hotel.country || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("hotel.address")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {hotel.address || "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("hotel.latitude")}</Typography>
              <Typography mt={0.5}>{hotel.latitude ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("hotel.longitude")}</Typography>
              <Typography mt={0.5}>{hotel.longitude ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("hotel.distanceFromHaram")}</Typography>
              <Typography mt={0.5}>{hotel.distance_from_haram ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("hotel.googleMap")}</Typography>
              <Typography mt={0.5}>
                {hotel.google_map ? (
                  <a href={hotel.google_map} target="_blank" rel="noreferrer">
                    {hotel.google_map}
                  </a>
                ) : (
                  "-"
                )}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("hotel.contactSection")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("hotel.phone")}</Typography>
              <Typography mt={0.5}>{hotel.phone || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("hotel.email")}</Typography>
              <Typography mt={0.5}>{hotel.email || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("hotel.website")}</Typography>
              <Typography mt={0.5}>{hotel.website || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption">{t("hotel.remarks")}</Typography>
          <Typography mt={0.5} whiteSpace="pre-wrap">
            {hotel.remarks || "-"}
          </Typography>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate("/app/inventory/hotels")}
            size="large"
          >
            {t("common.back")}
          </Button>

          <Box display="flex" gap={2}>
            {perms.can_edit && !isTrash && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/app/inventory/hotels/${uuid}/edit`)}
              >
                {t("common.edit")}
              </Button>
            )}
          </Box>
        </Box>
    </FormPageLayout>
  );
}
