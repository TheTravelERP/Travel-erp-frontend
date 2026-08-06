// src/features/customer/pages/CustomerViewPage.tsx
//
// Customer 360° view — structural reference point for uniformity across
// Customer/Quotation/Booking 360° views (Enquiry's EnquiryViewPage.tsx is
// the other reference this pattern was extracted from). Built on the shared
// DetailPageLayout/DetailSection/DetailField components under
// src/components/detail/ — Quotation/Booking's view pages should adopt the
// same three components rather than re-hand-rolling section Paper blocks.

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useTranslation } from "react-i18next";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getCustomerByUuid } from "../customer.api";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../hooks/usePermission";
import FilePreviewDialog from "../../../components/common/FilePreviewDialog";
import { getFileKind, resolveUploadUrl } from "../../../services/upload.service";
import DetailPageLayout from "../../../components/detail/DetailPageLayout";
import DetailSection from "../../../components/detail/DetailSection";
import DetailField from "../../../components/detail/DetailField";
import DropdownColorChip from "../../../components/common/DropdownColorChip";
import CommunicationHistory from "../../../components/common/CommunicationHistory";
import AttachmentList from "../../../components/common/AttachmentList";
import NoteList from "../../../components/common/NoteList";
import TaskList from "../../../components/common/TaskList";
import ActivityTimeline from "../../../components/common/ActivityTimeline";
import { useLocalizationProfile } from "../../../hooks/useLocalizationProfile";
import { formatDate } from "../../../utils/formatters/localization";
import { getEnquiries } from "../../enquiry/enquiry.api";
import type { EnquiryListItem } from "../../enquiry/enquiry.types";
import { getQuotationsList } from "../../crm/quotation/quotation.api";
import type { QuotationListItem } from "../../crm/quotation/quotation.types";
import { getBookingsList } from "../../booking/booking.api";
import type { BookingListItem } from "../../booking/booking.types";

import type { CustomerDetail } from "../customer.types";

const QUOTATION_STATUS_COLOR: Record<string, "default" | "primary" | "success" | "error" | "warning"> = {
  Draft: "default", Sent: "primary", Revised: "warning",
  Accepted: "success", Rejected: "error", Expired: "error", Converted: "success",
};

const BOOKING_STATUS_COLOR: Record<string, "default" | "primary" | "success" | "error" | "warning"> = {
  Draft: "default", Confirmed: "success", "Partially Confirmed": "warning",
  "Travel Started": "primary", Completed: "success", Cancelled: "error", Closed: "default",
};

function DocumentThumb({ label, url }: { label: string; url?: string | null }) {
  const [open, setOpen] = useState(false);
  const resolvedUrl = resolveUploadUrl(url);
  const kind = resolvedUrl ? getFileKind(resolvedUrl) : null;

  return (
    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
      <Typography variant="caption" display="block" mb={0.5}>
        {label}
      </Typography>
      {resolvedUrl ? (
        <>
          {kind === "image" ? (
            <Avatar
              src={resolvedUrl}
              variant="rounded"
              onClick={() => setOpen(true)}
              sx={{ width: 72, height: 72, cursor: "pointer" }}
            />
          ) : (
            <Chip
              icon={kind === "pdf" ? <PictureAsPdfIcon /> : <InsertDriveFileIcon />}
              label={kind === "pdf" ? "PDF" : "File"}
              clickable
              onClick={() => setOpen(true)}
            />
          )}
          <FilePreviewDialog
            open={open}
            url={resolvedUrl}
            label={label}
            onClose={() => setOpen(false)}
          />
        </>
      ) : (
        <Typography mt={0.5}>-</Typography>
      )}
    </Grid>
  );
}

export default function CustomerViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const localizationProfile = useLocalizationProfile();

  const perms = usePermission("crm.customers");

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);

  const [enquiries, setEnquiries] = useState<EnquiryListItem[]>([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(false);

  const [quotations, setQuotations] = useState<QuotationListItem[]>([]);
  const [quotationsLoading, setQuotationsLoading] = useState(false);

  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  useEffect(() => {
    if (uuid) {
      loadCustomer();
      loadEnquiries();
      loadQuotations();
      loadBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadCustomer() {
    try {
      const data = await getCustomerByUuid(uuid!, isTrash);
      setCustomer(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/crm/customers");
    } finally {
      setLoading(false);
    }
  }

  async function loadEnquiries() {
    if (!uuid) return;
    setEnquiriesLoading(true);
    try {
      const res = await getEnquiries({
        cust_uuid: uuid,
        page_size: 50,
        sort_by: "created_at",
        sort_order: "desc",
      });
      setEnquiries(res.data);
    } catch {
      // Non-critical panel — a failed fetch just leaves it empty rather
      // than blocking the rest of the customer page.
    } finally {
      setEnquiriesLoading(false);
    }
  }

  async function loadQuotations() {
    if (!uuid) return;
    setQuotationsLoading(true);
    try {
      const res = await getQuotationsList({
        cust_uuid: uuid,
        page_size: 50,
        sort_by: "quotation_date",
        sort_order: "desc",
      });
      setQuotations(res.data);
    } catch {
      // Non-critical panel, same reasoning as loadEnquiries above.
    } finally {
      setQuotationsLoading(false);
    }
  }

  async function loadBookings() {
    if (!uuid) return;
    setBookingsLoading(true);
    try {
      const res = await getBookingsList({
        cust_uuid: uuid,
        page_size: 50,
        sort_by: "booking_date",
        sort_order: "desc",
      });
      setBookings(res.data);
    } catch {
      // Non-critical panel, same reasoning as loadEnquiries above.
    } finally {
      setBookingsLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!customer) {
    return null;
  }

  return (
    <DetailPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.crm.customers"), href: "/app/crm/customers" },
        { label: t("common.view") },
      ]}
      onBack={() => navigate("/app/crm/customers")}
      actions={
        perms.can_edit && (
          <Button variant="contained" size="large" onClick={() => navigate(`/app/crm/customers/${uuid}/edit`)}>
            {t("common.edit")}
          </Button>
        )
      }
    >
      <DetailSection title={t("settings.personalDetails")}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailField label={t("common.customerName")} value={customer.name} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailField label={t("common.mobile")} value={customer.mobile} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailField label={t("common.email")} value={customer.email} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailField
              label={t("settings.dateOfBirth")}
              value={customer.dob ? formatDate(customer.dob, localizationProfile) : undefined}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailField label={t("settings.gender")} value={customer.gender} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailField label={t("customer.nationality")} value={customer.nationality} />
          </Grid>
        </Grid>
      </DetailSection>

      <DetailSection title={t("customer.passportDetails")}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <DetailField label={t("customer.passportNumber")} value={customer.passport_no} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <DetailField
              label={t("customer.passportIssueDate")}
              value={customer.passport_issue_date ? formatDate(customer.passport_issue_date, localizationProfile) : undefined}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <DetailField
              label={t("customer.passportExpiryDate")}
              value={customer.passport_expiry_date ? formatDate(customer.passport_expiry_date, localizationProfile) : undefined}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <DetailField label={t("customer.passportIssueCountry")} value={customer.passport_issue_country} />
          </Grid>
        </Grid>
      </DetailSection>

      <DetailSection title={t("customer.documents")}>
        <Grid container spacing={3}>
          <DocumentThumb label={t("customer.picture")} url={customer.picture_url} />
          <DocumentThumb label={t("customer.passportFront")} url={customer.passport_front_url} />
          <DocumentThumb label={t("customer.passportBack")} url={customer.passport_back_url} />
          {(["doc1", "doc2", "doc3", "doc4"] as const).map((slot) => {
            const url = customer[`${slot}_url`];
            if (!url) return null;
            return (
              <DocumentThumb
                key={slot}
                label={customer[`${slot}_label`] || t("settings.documentFile")}
                url={url}
              />
            );
          })}
        </Grid>
      </DetailSection>

      <DetailSection title={t("customer.businessDetails")}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <DetailField label={t("customer.taxId")} value={customer.gstin} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <DetailField label={t("customer.billingAddress")} value={customer.billing_address} preserveWhitespace />
          </Grid>
        </Grid>
      </DetailSection>

      {!isTrash && (
        <DetailSection title={t("menu.crm.enquiries")}>
          {enquiriesLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}><CircularProgress size={24} /></Box>
          ) : enquiries.length === 0 ? (
            <Typography variant="body2" color="text.secondary">{t("common.noRecordsFound")}</Typography>
          ) : (
            <Stack spacing={1.5} divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />}>
              {enquiries.map((e) => (
                <Box
                  key={e.uuid}
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/app/enquiries/${e.uuid}`)}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" fontWeight={600}>{e.enquiry_no}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatDate(e.created_at, localizationProfile)}</Typography>
                    </Stack>
                    <DropdownColorChip dropdownName="enquiry_status" value={e.conversion_status} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{e.business_type}</Typography>
                </Box>
              ))}
            </Stack>
          )}
        </DetailSection>
      )}

      {!isTrash && (
        <DetailSection title={t("enquiry.quotations")}>
          {quotationsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}><CircularProgress size={24} /></Box>
          ) : quotations.length === 0 ? (
            <Typography variant="body2" color="text.secondary">{t("common.noRecordsFound")}</Typography>
          ) : (
            <Stack spacing={1.5} divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />}>
              {quotations.map((q) => (
                <Box
                  key={q.uuid}
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/app/crm/quotations/${q.uuid}`)}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" fontWeight={600}>
                        {q.quotation_no}{q.revision_no > 1 ? ` (Rev ${q.revision_no})` : ""}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">{formatDate(q.quotation_date, localizationProfile)}</Typography>
                    </Stack>
                    <Chip size="small" color={QUOTATION_STATUS_COLOR[q.status] ?? "default"} label={q.status} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {q.currency_code} {q.net_amount.toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </DetailSection>
      )}

      {!isTrash && (
        <DetailSection title={t("menu.packages.bookings")}>
          {bookingsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}><CircularProgress size={24} /></Box>
          ) : bookings.length === 0 ? (
            <Typography variant="body2" color="text.secondary">{t("common.noRecordsFound")}</Typography>
          ) : (
            <Stack spacing={1.5} divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />}>
              {bookings.map((b) => (
                <Box
                  key={b.uuid}
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/app/bookings/list/${b.uuid}`)}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" fontWeight={600}>{b.booking_no}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatDate(b.booking_date, localizationProfile)}</Typography>
                    </Stack>
                    <Chip size="small" color={BOOKING_STATUS_COLOR[b.status] ?? "default"} label={b.status} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {b.business_type} · {b.currency_code} {b.net_amount.toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </DetailSection>
      )}

      {!isTrash && (
        <DetailSection title={t("common.attachments")}>
          <AttachmentList entityType="customer" entityUuid={uuid!} menuKey="crm.customers" canEdit={perms.can_edit} />
        </DetailSection>
      )}

      {!isTrash && (
        <DetailSection title={t("menu.tasks")}>
          <TaskList linkedEntityType="customer" linkedEntityUuid={uuid!} />
        </DetailSection>
      )}

      {!isTrash && (
        <DetailSection title={t("common.notes")}>
          <NoteList entityType="customer" entityUuid={uuid!} canEdit={perms.can_edit} />
        </DetailSection>
      )}

      {!isTrash && (
        <DetailSection title={t("communicationHistory.title")}>
          <CommunicationHistory entityType="customer" entityUuid={uuid!} />
        </DetailSection>
      )}

      {!isTrash && (
        <DetailSection title={t("common.activity")}>
          <ActivityTimeline entityType="customer" entityUuid={uuid!} />
        </DetailSection>
      )}
    </DetailPageLayout>
  );
}
