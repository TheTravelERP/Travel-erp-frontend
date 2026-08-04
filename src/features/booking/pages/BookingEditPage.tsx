// src/features/booking/pages/BookingEditPage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import BookingForm from "../components/BookingForm";
import type { BookingDetail, BookingFormInput } from "../booking.types";
import { getBookingByUuid, updateBookingByUuid } from "../booking.api";
import { isSalesContextEditable } from "../booking.status";
import { usePermission } from "../../../hooks/usePermission";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../utils/errorMessage";
import FormPageLayout from "../../../components/forms/FormPageLayout";

export default function BookingEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("packages.bookings");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<BookingDetail>();

  useEffect(() => {
    loadBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadBooking() {
    try {
      const data = await getBookingByUuid(uuid!);
      if (data.status === "Cancelled" || data.status === "Closed") {
        showSnackbar({ message: t("booking.onlyDraftEditable"), severity: "error" });
        navigate(`/app/bookings/list/${uuid}`);
        return;
      }
      setDefaultValues(data);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/bookings/list");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: BookingFormInput) {
    try {
      await updateBookingByUuid(uuid!, { ...data, version_no: defaultValues!.version_no });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate(`/app/bookings/list/${uuid}`);
    } catch (err: any) {
      if (err?.response?.status === 409) {
        showSnackbar({ message: getErrorMessage(err, t("common.updateConflict")), severity: "error" });
        return;
      }
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    }
  }

  return (
    <FormPageLayout
      title={t("common.edit")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.packages.bookings"), href: "/app/bookings/list" },
        { label: t("common.edit") },
      ]}
    >
      {loading || !defaultValues ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <BookingForm
          defaultValues={defaultValues}
          onSubmit={handleUpdate}
          salesContextEditable={isSalesContextEditable(defaultValues)}
        />
      )}
    </FormPageLayout>
  );
}
