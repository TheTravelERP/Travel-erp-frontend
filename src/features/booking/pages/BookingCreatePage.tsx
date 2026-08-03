// src/features/booking/pages/BookingCreatePage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import BookingForm from "../components/BookingForm";
import type { BookingFormInput } from "../booking.types";
import { createBooking } from "../booking.api";
import { getEnquiryByUuid } from "../../enquiry/enquiry.api";
import { usePermission } from "../../../hooks/usePermission";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../utils/errorMessage";
import FormPageLayout from "../../../components/forms/FormPageLayout";

export default function BookingCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const enquiryUuid = searchParams.get("enquiry_uuid") || undefined;

  const perms = usePermission("packages.bookings");

  const [loading, setLoading] = useState(Boolean(enquiryUuid));
  const [prefill, setPrefill] = useState<Partial<BookingFormInput>>();

  useEffect(() => {
    if (!enquiryUuid) return;
    getEnquiryByUuid(enquiryUuid)
      .then((enquiry) => {
        setPrefill({
          enquiry_uuid: enquiryUuid,
          cust_uuid: enquiry.cust_uuid ?? undefined,
          business_type: enquiry.business_type,
        });
      })
      .catch(() => showSnackbar({ message: t("common.loadFailed"), severity: "error" }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enquiryUuid]);

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: BookingFormInput) {
    try {
      const booking = await createBooking(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate(`/app/bookings/list/${booking.uuid}`);
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.createFailed")), severity: "error" });
    }
  }

  return (
    <FormPageLayout
      title={t("common.create")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.packages.bookings"), href: "/app/bookings/list" },
        { label: t("common.create") },
      ]}
    >
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <BookingForm defaultValues={prefill} onSubmit={handleCreate} />
      )}
    </FormPageLayout>
  );
}
