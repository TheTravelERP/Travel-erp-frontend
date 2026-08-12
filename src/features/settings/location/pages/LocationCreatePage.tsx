// src/features/settings/location/pages/LocationCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LocationForm from "../components/LocationForm";
import type { LocationFormInput } from "../location.types";
import { createLocation } from "../location.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function LocationCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.location_master");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: LocationFormInput) {
    try {
      await createLocation(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/settings/location-master");
    } catch (err: any) {
      showSnackbar({
        message: getErrorMessage(err, t("common.createFailed")),
        severity: "error",
      });
    }
  }

  return (
    <FormPageLayout
      title={t("common.create")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.settings.location_master"), href: "/app/settings/location-master" },
        { label: t("common.create") },
      ]}
    >
      <LocationForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
