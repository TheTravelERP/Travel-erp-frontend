// src/features/settings/serviceType/pages/ServiceTypeCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ServiceTypeForm from "../components/ServiceTypeForm";
import type { ServiceTypeFormInput } from "../serviceType.types";
import { createServiceType } from "../serviceType.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function ServiceTypeCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.service_type_master");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: ServiceTypeFormInput) {
    try {
      await createServiceType(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/settings/service-type-master");
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
        { label: t("menu.settings.service_type_master"), href: "/app/settings/service-type-master" },
        { label: t("common.create") },
      ]}
    >
      <ServiceTypeForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
