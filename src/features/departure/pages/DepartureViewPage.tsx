// src/features/departure/pages/DepartureViewPage.tsx
import { useEffect, useState } from "react";
import {
  Box, Breadcrumbs, Button, Chip, CircularProgress, Grid, LinearProgress, Link, Stack, Typography,
} from "@mui/material";
import { Navigate, Link as RouterLink, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { getDepartureByUuid, getDepartureBookings, getDepartureSummary } from "../departure.api";
import type { DepartureDetail, DepartureSummary } from "../departure.types";
import BookingDetailTabs from "../../booking/components/BookingDetailTabs";
import BookingTable from "../../booking/components/BookingTable";
import DepartureTravellersTable from "../components/DepartureTravellersTable";
import DepartureBranchBreakdownTable from "../components/DepartureBranchBreakdownTable";
import DepartureServicesTable from "../components/DepartureServicesTable";
import DeparturePaymentsTable from "../components/DeparturePaymentsTable";
import DepartureDocumentsPanel from "../components/DepartureDocumentsPanel";
import CommunicationHistory from "../../../components/common/CommunicationHistory";
import ActivityTimeline from "../../../components/common/ActivityTimeline";
import { usePermission } from "../../../hooks/usePermission";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { useLocalizationProfile } from "../../../hooks/useLocalizationProfile";
import { formatDate } from "../../../utils/formatters/localization";
import type { BookingListItem } from "../../booking/booking.types";

const STATUS_COLOR: Record<string, "default" | "primary" | "success" | "error" | "warning" | "info"> = {
  Draft: "default",
  Open: "success",
  Closed: "warning",
  Departed: "info",
  Completed: "primary",
  Cancelled: "error",
};

export default function DepartureViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();

  const perms = usePermission("packages.departures");

  const [loading, setLoading] = useState(true);
  const [departure, setDeparture] = useState<DepartureDetail | null>(null);
  const [summary, setSummary] = useState<DepartureSummary | null>(null);

  const [bookingRows, setBookingRows] = useState<BookingListItem[]>([]);
  const [bookingTotal, setBookingTotal] = useState(0);
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingPageSize, setBookingPageSize] = useState(10);
  const [bookingLoading, setBookingLoading] = useState(true);

  const [tabCounts, setTabCounts] = useState<{ bookings?: number; travellers?: number; services?: number; payments?: number; documents?: number }>({});

  useEffect(() => {
    if (uuid) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  useEffect(() => {
    if (uuid) {
      loadBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid, bookingPage, bookingPageSize]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function load() {
    try {
      const [departureData, summaryData] = await Promise.all([
        getDepartureByUuid(uuid!, isTrash),
        getDepartureSummary(uuid!),
      ]);
      setDeparture(departureData);
      setSummary(summaryData);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });
      navigate("/app/packages/departures");
    } finally {
      setLoading(false);
    }
  }

  async function loadBookings() {
    setBookingLoading(true);
    try {
      const res = await getDepartureBookings(uuid!, { page: bookingPage, page_size: bookingPageSize });
      setBookingRows(res.data);
      setBookingTotal(res.pagination.total);
      setTabCounts((prev) => ({ ...prev, bookings: res.pagination.total }));
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
    } finally {
      setBookingLoading(false);
    }
  }

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;
  }

  if (!departure || !summary) {
    return null;
  }

  const summaryTab = (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Chip color={STATUS_COLOR[departure.status || "Draft"] ?? "default"} label={departure.status} />
        <Typography variant="body2" color="text.secondary">
          {t("departure.summary.completionPercent")}: {summary.completion_percent}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={Math.min(summary.completion_percent, 100)}
        sx={{ mb: 3, height: 8, borderRadius: 4 }}
      />

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("departure.package")}</Typography><Typography>{summary.pkg_name} {summary.pkg_code ? `(${summary.pkg_code})` : ""}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("departure.departureDate")}</Typography><Typography>{formatDate(summary.departure_date, localizationProfile)}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("departure.returnDate")}</Typography><Typography>{summary.return_date ? formatDate(summary.return_date, localizationProfile) : "-"}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("departure.duration")}</Typography><Typography>{summary.duration_days != null ? `${summary.duration_days} ${t("common.days", { defaultValue: "days" })}` : "-"}</Typography></Grid>

        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("departure.totalSeats")}</Typography><Typography>{summary.total_seats}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("departure.summary.confirmedPax")}</Typography><Typography>{summary.confirmed_pax}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("departure.summary.availableSeats")}</Typography><Typography>{summary.available_seats}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("departure.waitlistSeats")}</Typography><Typography>{summary.waitlist_seats}</Typography></Grid>

        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("departure.summary.totalBookings")}</Typography><Typography>{summary.total_bookings}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("departure.summary.totalTravellers")}</Typography><Typography>{summary.total_travellers}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("booking.paxAdult")} / {t("booking.paxChild")} / {t("booking.paxInfant")}</Typography><Typography>{summary.pax_adult} / {summary.pax_child} / {summary.pax_infant}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("departure.summary.revenue")}</Typography><Typography>{summary.revenue.toFixed(2)}</Typography></Grid>
      </Grid>

      {Object.keys(summary.booking_status_counts).length > 0 && (
        <>
          <Typography variant="body2" color="text.secondary" mt={3} mb={1}>
            {t("departure.summary.bookingStatusBreakdown")}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(summary.booking_status_counts).map(([status, count]) => (
              <Chip key={status} size="small" color={STATUS_COLOR[status] ?? "default"} label={`${status}: ${count}`} />
            ))}
          </Stack>
        </>
      )}

      <Typography variant="body2" color="text.secondary" mt={3} mb={1}>
        {t("departure.branchBreakdown.title")}
      </Typography>
      <DepartureBranchBreakdownTable departureUuid={departure.uuid} />

      {departure.allowed_branch_uuids && departure.allowed_branch_uuids.length > 0 && (
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          {t("departure.allowedBranchesRestrictedNote", { count: departure.allowed_branch_uuids.length })}
        </Typography>
      )}

      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap mt={3}>
        {perms.can_edit && !isTrash && (
          <Button variant="outlined" onClick={() => navigate(`/app/packages/departures/${departure.uuid}/edit`)}>{t("common.edit")}</Button>
        )}
      </Stack>
    </>
  );

  const withCount = (label: string, count?: number) => (count != null ? `${label} (${count})` : label);

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {departure.departure_code} &mdash; {departure.departure_name}
      </Typography>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/app/dashboard" underline="hover">
          {t("menu.dashboard")}
        </Link>
        <Link component={RouterLink} to="/app/packages/departures" underline="hover">
          {t("menu.packages.departures")}
        </Link>
        <Typography color="text.primary">{departure.departure_code}</Typography>
      </Breadcrumbs>

      <BookingDetailTabs
        tabs={[
          { key: "summary", label: t("departure.tabs.summary"), content: summaryTab },
          {
            key: "bookings",
            label: withCount(t("departure.tabs.bookings"), tabCounts.bookings),
            content: (
              <BookingTable
                rows={bookingRows}
                loading={bookingLoading}
                page={bookingPage}
                pageSize={bookingPageSize}
                total={bookingTotal}
                onPageChange={setBookingPage}
                onPageSizeChange={(s) => { setBookingPageSize(s); setBookingPage(1); }}
                onRefresh={loadBookings}
              />
            ),
          },
          {
            key: "travellers",
            label: withCount(t("departure.tabs.travellers"), tabCounts.travellers),
            content: (
              <DepartureTravellersTable
                departureUuid={departure.uuid}
                onCountChange={(count) => setTabCounts((prev) => ({ ...prev, travellers: count }))}
              />
            ),
          },
          {
            key: "services",
            label: withCount(t("departure.tabs.services"), tabCounts.services),
            content: (
              <DepartureServicesTable
                departureUuid={departure.uuid}
                onCountChange={(count) => setTabCounts((prev) => ({ ...prev, services: count }))}
              />
            ),
          },
          {
            key: "payments",
            label: withCount(t("departure.tabs.payments"), tabCounts.payments),
            content: (
              <DeparturePaymentsTable
                departureUuid={departure.uuid}
                onCountChange={(count) => setTabCounts((prev) => ({ ...prev, payments: count }))}
              />
            ),
          },
          {
            key: "documents",
            label: withCount(t("departure.tabs.documents"), tabCounts.documents),
            content: (
              <DepartureDocumentsPanel
                departureUuid={departure.uuid}
                canEdit={perms.can_edit}
                onCountChange={(count) => setTabCounts((prev) => ({ ...prev, documents: count }))}
              />
            ),
          },
          {
            key: "communication",
            label: t("departure.tabs.communication"),
            content: <CommunicationHistory entityType="departure" entityUuid={departure.uuid} />,
          },
          {
            key: "timeline",
            label: t("departure.tabs.timeline"),
            content: <ActivityTimeline entityType="departure" entityUuid={departure.uuid} />,
          },
        ]}
      />
    </Box>
  );
}
