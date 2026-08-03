// src/features/package/packageDetail/pages/PackageDetailViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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

import { getPackageDetailByUuid } from "../packageDetail.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";
import FormPageLayout from "../../../../components/forms/FormPageLayout";
import { resolveUploadUrl } from "../../../../services/upload.service";

import type { PackageDetailDetail } from "../packageDetail.types";

export default function PackageDetailViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("packages.details");

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<PackageDetailDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadPackageDetail();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadPackageDetail() {
    try {
      const data = await getPackageDetailByUuid(uuid!, isTrash);
      setDetail(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/packages/details");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!detail) {
    return null;
  }

  const itinerary = detail.itinerary || [];
  const brochureUrl = resolveUploadUrl(detail.brochure_path);

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.packages.details"), href: "/app/packages/details" },
        { label: t("common.view") },
      ]}
    >
        {/* ================= OVERVIEW ================= */}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("menu.packages.details")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="caption">{t("packageDetail.title")}</Typography>
              <Typography mt={0.5}>{detail.title}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("common.status")}</Typography>
              <Box mt={0.5}>
                <Chip
                  size="small"
                  label={detail.is_active ? t("common.active") : t("common.inactive")}
                  color={detail.is_active ? "success" : "default"}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("packageDetail.overview")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {detail.overview || "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t("packageDetail.inclusions")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {detail.inclusions || "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t("packageDetail.exclusions")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {detail.exclusions || "-"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= ITINERARY ================= */}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("packageDetail.itinerary")}
          </Typography>

          {itinerary.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("packageDetail.noDaysYet")}
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={80}>{t("packageDetail.day")}</TableCell>
                    <TableCell>{t("packageDetail.dayTitle")}</TableCell>
                    <TableCell>{t("packageDetail.dayDescription")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {itinerary.map((day, index) => (
                    <TableRow key={index}>
                      <TableCell>{day.day}</TableCell>
                      <TableCell>{day.title}</TableCell>
                      <TableCell>{day.description || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        {/* ================= POLICIES ================= */}

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t("packageDetail.termsConditions")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {detail.terms_conditions || "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t("packageDetail.paymentPolicy")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {detail.payment_policy || "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t("packageDetail.cancellationPolicy")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {detail.cancellation_policy || "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t("packageDetail.importantNotes")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {detail.important_notes || "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t("packageDetail.brochure")}</Typography>
              <Typography mt={0.5}>
                {brochureUrl ? (
                  <Chip
                    label={t("packageDetail.brochure")}
                    clickable
                    component="a"
                    href={brochureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ) : (
                  "-"
                )}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= FOOTER ================= */}

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate("/app/packages/details")}
            size="large"
          >
            {t("common.back")}
          </Button>

          <Box display="flex" gap={2}>
            {perms.can_edit && !isTrash && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/app/packages/details/${uuid}/edit`)}
              >
                {t("common.edit")}
              </Button>
            )}
          </Box>
        </Box>
    </FormPageLayout>
  );
}
