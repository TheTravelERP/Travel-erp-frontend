// src/features/package/pages/PackageViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Button, Chip, Divider, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getPackageByUuid } from "../package.api";
import { getBranches } from "../../settings/branch/branch.api";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../hooks/usePermission";
import FormPageLayout from "../../../components/forms/FormPageLayout";
import { useLocalizationProfile } from "../../../hooks/useLocalizationProfile";
import { formatDate } from "../../../utils/formatters/localization";
import DropdownColorChip from "../../../components/common/DropdownColorChip";

import type { PackageDetailResponse } from "../package.types";
import type { BranchListItem } from "../../settings/branch/branch.types";

export default function PackageViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();

  const perms = usePermission("packages.list");

  const [loading, setLoading] = useState(true);
  const [pkg, setPkg] = useState<PackageDetailResponse | null>(null);
  const [branches, setBranches] = useState<BranchListItem[]>([]);

  useEffect(() => {
    if (uuid) {
      loadPackage();
    }
    getBranches({ page_size: 100 })
      .then((res) => setBranches(res.data))
      .catch(() => {});
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadPackage() {
    try {
      const data = await getPackageByUuid(uuid!, isTrash);
      setPkg(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/packages/list");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!pkg) {
    return null;
  }

  const allowedBranchNames = (pkg.allowed_branch_uuids || []).map((branchUuid) => {
    const branch = branches.find((b) => b.uuid === branchUuid);
    return branch ? branch.branch_name : branchUuid;
  });

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.packages.list"), href: "/app/packages/list" },
        { label: t("common.view") },
      ]}
    >
        {/* ================= BASIC INFO ================= */}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("package.basicInfo")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("package.code")}</Typography>
              <Typography mt={0.5}>{pkg.code}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Typography variant="caption">{t("package.name")}</Typography>
              <Typography mt={0.5}>{pkg.name}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("package.shortName")}</Typography>
              <Typography mt={0.5}>{pkg.short_name || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("package.status")}</Typography>
              <Box mt={0.5}>
                {pkg.status ? <DropdownColorChip dropdownName="package_status" value={pkg.status} /> : "-"}
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 4 }}>
              <Typography variant="caption">{t("package.featured")}</Typography>
              <Box mt={0.5}>
                <Chip
                  size="small"
                  label={pkg.featured ? t("common.active") : t("common.inactive")}
                  color={pkg.featured ? "success" : "default"}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 6, md: 4 }}>
              <Typography variant="caption">{t("common.status")}</Typography>
              <Box mt={0.5}>
                <Chip
                  size="small"
                  label={pkg.is_active ? t("common.active") : t("common.inactive")}
                  color={pkg.is_active ? "success" : "default"}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= ROUTE & DATES ================= */}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("package.routeSection")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("package.departureCity")}</Typography>
              <Typography mt={0.5}>{pkg.departure_city || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("package.arrivalCity")}</Typography>
              <Typography mt={0.5}>{pkg.arrival_city || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("package.country")}</Typography>
              <Typography mt={0.5}>{pkg.country || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("package.departureDate")}</Typography>
              <Typography mt={0.5}>{pkg.departure_date ? formatDate(pkg.departure_date, localizationProfile) : "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("package.returnDate")}</Typography>
              <Typography mt={0.5}>{pkg.return_date ? formatDate(pkg.return_date, localizationProfile) : "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("package.bookingStartDate")}</Typography>
              <Typography mt={0.5}>{pkg.booking_start_date ? formatDate(pkg.booking_start_date, localizationProfile) : "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("package.bookingEndDate")}</Typography>
              <Typography mt={0.5}>{pkg.booking_end_date ? formatDate(pkg.booking_end_date, localizationProfile) : "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= DURATION & CAPACITY ================= */}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("package.durationSection")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption">{t("package.durationDays")}</Typography>
              <Typography mt={0.5}>{pkg.duration_days ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption">{t("package.durationNights")}</Typography>
              <Typography mt={0.5}>{pkg.duration_nights ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption">{t("package.minimumPax")}</Typography>
              <Typography mt={0.5}>{pkg.minimum_pax ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption">{t("package.maximumPax")}</Typography>
              <Typography mt={0.5}>{pkg.maximum_pax ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 2.4 }}>
              <Typography variant="caption">{t("package.totalSeats")}</Typography>
              <Typography mt={0.5}>{pkg.total_seats ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 2.4 }}>
              <Typography variant="caption">{t("package.bookedSeats")}</Typography>
              <Typography mt={0.5}>{pkg.booked_seats ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 2.4 }}>
              <Typography variant="caption">{t("package.blockedSeats")}</Typography>
              <Typography mt={0.5}>{pkg.blocked_seats ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 2.4 }}>
              <Typography variant="caption">{t("package.waitlistSeats")}</Typography>
              <Typography mt={0.5}>{pkg.waitlist_seats ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 2.4 }}>
              <Typography variant="caption">{t("package.availableSeats")}</Typography>
              <Typography mt={0.5} fontWeight={600}>{pkg.available_seats ?? "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= CURRENCY ================= */}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("package.currencySection")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("package.currencyCode")}</Typography>
              <Typography mt={0.5}>{pkg.currency_code}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("package.exchangeRate")}</Typography>
              <Typography mt={0.5}>{pkg.exchange_rate ?? "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= ALLOWED BRANCHES ================= */}

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("package.allowedBranchesSection")}
          </Typography>

          <Typography variant="caption">{t("package.allowedBranches")}</Typography>
          <Typography mt={0.5}>
            {allowedBranchNames.length ? allowedBranchNames.join(", ") : t("common.allowedBranchesHelper")}
          </Typography>
        </Paper>

        {/* ================= FOOTER ================= */}

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate("/app/packages/list")}
            size="large"
          >
            {t("common.back")}
          </Button>

          <Box display="flex" gap={2}>
            {perms.can_edit && !isTrash && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/app/packages/list/${uuid}/edit`)}
              >
                {t("common.edit")}
              </Button>
            )}
          </Box>
        </Box>
    </FormPageLayout>
  );
}
