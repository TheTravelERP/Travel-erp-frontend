// src/features/booking/pages/BookingViewPage.tsx
import { useEffect, useState } from "react";
import {
  Box, Breadcrumbs, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, Link, Stack, TextField, Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { bookingPdfDownloadUrl, cancelBooking, confirmBooking, getBookingByUuid } from "../booking.api";
import type { BookingDetail } from "../booking.types";
import { getTravellers } from "../traveller.api";
import { getBookingServiceLines } from "../bookingService.api";
import { getBookingReminders } from "../bookingReminder.api";
import { getDepartureByUuid } from "../../departure/departure.api";
import type { DepartureDetail } from "../../departure/departure.types";
import BookingDetailTabs from "../components/BookingDetailTabs";
import TravellerList from "../components/TravellerList";
import BookingServiceList from "../components/BookingServiceList";
import BookingTimelineTab from "../components/BookingTimelineTab";
import BookingReminderList from "../components/BookingReminderList";
import AttachmentList from "../../../components/common/AttachmentList";
import { listAttachments } from "../../../services/attachment.service";
import CommunicationHistory from "../../../components/common/CommunicationHistory";
import EntityContextBar from "../../../components/common/EntityContextBar";
import { usePermission } from "../../../hooks/usePermission";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../utils/errorMessage";
import { useLocalizationProfile } from "../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../utils/formatters/localization";

const STATUS_COLOR: Record<string, "default" | "primary" | "success" | "error" | "warning"> = {
  Draft: "default",
  Confirmed: "success",
  "Partially Confirmed": "warning",
  "Travel Started": "primary",
  Completed: "success",
  Cancelled: "error",
  Closed: "default",
};

export default function BookingViewPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const perms = usePermission("packages.bookings");
  const travellerPerms = usePermission("packages.bookings.travellers");
  const localizationProfile = useLocalizationProfile();
  const { formatDate } = createFormatters(localizationProfile);

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [departureDetail, setDepartureDetail] = useState<DepartureDetail | null>(null);
  const [tabCounts, setTabCounts] = useState<{ travellers?: number; services?: number; attachments?: number; reminders?: number }>({});

  const load = async () => {
    if (!uuid) return;
    setLoading(true);
    try {
      const data = await getBookingByUuid(uuid);
      setBooking(data);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  useEffect(() => {
    if (booking?.departure_uuid) {
      getDepartureByUuid(booking.departure_uuid).then(setDepartureDetail).catch(() => setDepartureDetail(null));
    } else {
      setDepartureDetail(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.departure_uuid]);

  useEffect(() => {
    if (!booking?.uuid) return;
    const bookingUuid = booking.uuid;
    Promise.allSettled([
      getTravellers(bookingUuid, { page: 1, page_size: 1 }),
      getBookingServiceLines(bookingUuid),
      getBookingReminders(bookingUuid),
      listAttachments("booking", bookingUuid, "packages.bookings"),
    ]).then(([travellersRes, servicesRes, remindersRes, attachmentsRes]) => {
      setTabCounts((prev) => ({
        travellers: travellersRes.status === "fulfilled" ? travellersRes.value.pagination.total : prev.travellers,
        services: servicesRes.status === "fulfilled" ? servicesRes.value.length : prev.services,
        reminders: remindersRes.status === "fulfilled" ? remindersRes.value.length : prev.reminders,
        attachments: attachmentsRes.status === "fulfilled" ? attachmentsRes.value.length : prev.attachments,
      }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.uuid]);

  async function handleConfirm() {
    if (!uuid) return;
    setActionLoading(true);
    try {
      await confirmBooking(uuid);
      showSnackbar({ message: t("booking.confirmedSuccess"), severity: "success" });
      load();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!uuid) return;
    setActionLoading(true);
    try {
      await cancelBooking(uuid, cancelReason);
      showSnackbar({ message: t("booking.cancelledSuccess"), severity: "success" });
      setCancelOpen(false);
      setCancelReason("");
      load();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading || !booking) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>;
  }

  const summaryTab = (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Chip color={STATUS_COLOR[booking.status] ?? "default"} label={booking.status} />
      </Stack>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("common.customer")}</Typography><Typography>{booking.customer_name}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("quotation.businessType")}</Typography><Typography>{booking.business_type || "-"}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("booking.enquiry")}</Typography><Typography>{booking.enquiry_no || "-"}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("quotation.quotationNo")}</Typography><Typography>{booking.quotation_no || "-"}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("booking.bookingDate")}</Typography><Typography>{formatDate(booking.booking_date!)}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("booking.travelStartDate")}</Typography><Typography>{booking.travel_start_date ? formatDate(booking.travel_start_date) : "-"}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("booking.travelEndDate")}</Typography><Typography>{booking.travel_end_date ? formatDate(booking.travel_end_date) : "-"}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("booking.salesExecutive")}</Typography><Typography>{booking.agent_name || "-"}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("common.source")}</Typography><Typography>{booking.lead_source || "-"}</Typography></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><Typography variant="body2" color="text.secondary">{t("booking.reference")}</Typography><Typography>{booking.reference || "-"}</Typography></Grid>
      </Grid>

      <Stack alignItems="flex-end" mt={3} spacing={0.5}>
        <Typography variant="body2">{t("booking.gross")}: {booking.currency_code} {booking.gross_amount.toFixed(2)}</Typography>
        <Typography variant="body2">{t("booking.tax")}: {booking.currency_code} {booking.tax_amount.toFixed(2)}</Typography>
        <Typography variant="h6">{t("booking.total")}: {booking.currency_code} {booking.net_amount.toFixed(2)}</Typography>
      </Stack>

      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap mt={3}>
        {perms.can_edit && booking.status === "Draft" && (
          <Button variant="outlined" onClick={() => navigate(`/app/bookings/list/${booking.uuid}/edit`)}>{t("common.edit")}</Button>
        )}
        {perms.can_edit && ["Draft", "Partially Confirmed"].includes(booking.status) && (
          <Button variant="contained" color="success" disabled={actionLoading} onClick={handleConfirm}>{t("booking.confirm")}</Button>
        )}
        {perms.can_edit && !["Cancelled", "Closed", "Completed"].includes(booking.status) && (
          <Button variant="outlined" color="error" disabled={actionLoading} onClick={() => setCancelOpen(true)}>{t("booking.cancel")}</Button>
        )}
        {perms.can_export && (
          <Button variant="outlined" href={bookingPdfDownloadUrl(booking.uuid)} target="_blank" rel="noopener noreferrer">
            {t("quotation.downloadPdf")}
          </Button>
        )}
      </Stack>
    </>
  );

  const withCount = (label: string, count?: number) => (count != null ? `${label} (${count})` : label);

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        {booking.booking_no}
      </Typography>
      <EntityContextBar
        fields={[
          booking.customer_name && { label: t("common.customer"), value: booking.customer_name },
          booking.package_snapshot?.pkg_name && { label: t("booking.package", "Package"), value: booking.package_snapshot.pkg_name },
          departureDetail && { label: t("booking.departure", "Departure"), value: `${departureDetail.departure_code} — ${departureDetail.departure_name}` },
          booking.travel_start_date && booking.travel_end_date && {
            label: t("booking.travelDates", "Travel Dates"),
            value: `${formatDate(booking.travel_start_date)} - ${formatDate(booking.travel_end_date)}`,
          },
        ].filter(Boolean) as { label: string; value: React.ReactNode }[]}
      />
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/app/dashboard" underline="hover">
          {t("menu.dashboard")}
        </Link>
        <Link component={RouterLink} to="/app/bookings/list" underline="hover">
          {t("menu.packages.bookings")}
        </Link>
        <Typography color="text.primary">{booking.booking_no}</Typography>
      </Breadcrumbs>

      <BookingDetailTabs
        tabs={[
          { key: "summary", label: t("common.summary"), content: summaryTab },
          {
            key: "travellers",
            label: withCount(t("booking.travellers"), tabCounts.travellers),
            content: (
              <TravellerList
                bookingUuid={booking.uuid}
                perms={travellerPerms}
                primaryCustomerUuid={booking.cust_uuid}
                onCountChange={(count) => setTabCounts((prev) => ({ ...prev, travellers: count }))}
              />
            ),
          },
          {
            key: "services",
            label: withCount(t("booking.services"), tabCounts.services),
            content: <BookingServiceList bookingUuid={booking.uuid} canEdit={perms.can_edit} onChanged={load} />,
          },
          {
            key: "attachments",
            label: withCount(t("common.attachments"), tabCounts.attachments),
            content: <AttachmentList entityType="booking" entityUuid={booking.uuid} menuKey="packages.bookings" canEdit={perms.can_edit} />,
          },
          {
            key: "communication",
            label: t("communicationHistory.title", { defaultValue: "Communication History" }),
            content: <CommunicationHistory entityType="booking" entityUuid={booking.uuid} />,
          },
          {
            key: "reminders",
            label: withCount(t("booking.reminders"), tabCounts.reminders),
            content: <BookingReminderList bookingUuid={booking.uuid} canEdit={perms.can_edit} />,
          },
          {
            key: "timeline",
            label: t("booking.timeline"),
            content: <BookingTimelineTab bookingUuid={booking.uuid} />,
          },
        ]}
      />

      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("booking.cancel")}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth multiline minRows={2} sx={{ mt: 1 }}
            label={t("booking.cancelReason")}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)}>{t("common.cancel")}</Button>
          <Button color="error" variant="contained" disabled={actionLoading} onClick={handleCancel}>{t("booking.cancel")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
