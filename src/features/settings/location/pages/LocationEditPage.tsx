// src/features/settings/location/pages/LocationEditPage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LocationForm from "../components/LocationForm";
import type { LocationFormInput } from "../location.types";
import { getLocationByUuid, updateLocationByUuid } from "../location.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function LocationEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.location_master");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<LocationFormInput>();
  const [versionNo, setVersionNo] = useState<number>();

  useEffect(() => {
    loadLocation();
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadLocation() {
    try {
      const data = await getLocationByUuid(uuid!);
      setDefaultValues(data);
      setVersionNo(data.version_no);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/settings/location-master");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: LocationFormInput) {
    try {
      await updateLocationByUuid(uuid!, { ...data, version_no: versionNo! });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate("/app/settings/location-master");
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
        { label: t("menu.settings.location_master"), href: "/app/settings/location-master" },
        { label: t("common.edit") },
      ]}
    >
      {loading || !defaultValues ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <LocationForm defaultValues={defaultValues} onSubmit={handleUpdate} />
      )}
    </FormPageLayout>
  );
}
