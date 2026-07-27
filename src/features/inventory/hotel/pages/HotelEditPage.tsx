// src/features/inventory/hotel/pages/HotelEditPage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import HotelForm from "../components/HotelForm";
import type { HotelFormInput } from "../hotel.types";
import { getHotelByUuid, updateHotelByUuid } from "../hotel.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function HotelEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("inventory.hotels");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<HotelFormInput>();
  const [versionNo, setVersionNo] = useState<number>();

  useEffect(() => {
    loadHotel();
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadHotel() {
    try {
      const data = await getHotelByUuid(uuid!);
      setDefaultValues(data);
      setVersionNo(data.version_no);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/inventory/hotels");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: HotelFormInput) {
    try {
      await updateHotelByUuid(uuid!, { ...data, version_no: versionNo! });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate("/app/inventory/hotels");
    } catch (err: any) {
      if (err?.response?.status === 409) {
        showSnackbar({
          message: getErrorMessage(err, t("common.updateConflict")),
          severity: "error",
        });
        return;
      }

      showSnackbar({
        message: getErrorMessage(err, t("common.updateFailed")),
        severity: "error",
      });
    }
  }

  return (
    <FormPageLayout
      title={t("common.edit")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.inventory.hotels"), href: "/app/inventory/hotels" },
        { label: t("common.edit") },
      ]}
    >
      {loading || !defaultValues ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <HotelForm defaultValues={defaultValues} onSubmit={handleUpdate} />
      )}
    </FormPageLayout>
  );
}
