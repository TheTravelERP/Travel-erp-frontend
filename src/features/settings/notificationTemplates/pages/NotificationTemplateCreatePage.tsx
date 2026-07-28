// src/features/settings/notificationTemplates/pages/NotificationTemplateCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import NotificationTemplateForm from "../components/NotificationTemplateForm";
import type { NotificationTemplateFormInput } from "../notificationTemplate.types";
import { createNotificationTemplate } from "../notificationTemplate.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function NotificationTemplateCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.notifications");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: NotificationTemplateFormInput) {
    try {
      await createNotificationTemplate(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/settings/notifications");
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
        { label: t("menu.settings.notifications"), href: "/app/settings/notifications" },
        { label: t("common.create") },
      ]}
    >
      <NotificationTemplateForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
