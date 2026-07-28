// src/features/settings/communicationProviders/pages/CommunicationProviderCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import CommunicationProviderForm from "../components/CommunicationProviderForm";
import type { CommunicationProviderFormInput } from "../communicationProvider.types";
import { createCommunicationProvider } from "../communicationProvider.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function CommunicationProviderCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.communication_settings");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: CommunicationProviderFormInput) {
    try {
      await createCommunicationProvider(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/settings/communication-settings");
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
        { label: t("menu.settings.communication_settings"), href: "/app/settings/communication-settings" },
        { label: t("common.create") },
      ]}
    >
      <CommunicationProviderForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
