// src/features/settings/notificationTemplates/pages/NotificationTemplateEditPage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import NotificationTemplateForm from "../components/NotificationTemplateForm";
import type { NotificationTemplateFormInput } from "../notificationTemplate.types";
import { getNotificationTemplateByUuid, updateNotificationTemplateByUuid } from "../notificationTemplate.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function NotificationTemplateEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.notifications");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<NotificationTemplateFormInput>();
  const [versionNo, setVersionNo] = useState<number>();

  useEffect(() => {
    loadTemplate();
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadTemplate() {
    try {
      const data = await getNotificationTemplateByUuid(uuid!);
      setDefaultValues(data);
      setVersionNo(data.version_no);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/settings/notifications");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: NotificationTemplateFormInput) {
    try {
      await updateNotificationTemplateByUuid(uuid!, { ...data, version_no: versionNo! });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate("/app/settings/notifications");
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
        { label: t("menu.settings.notifications"), href: "/app/settings/notifications" },
        { label: t("common.edit") },
      ]}
    >
      {loading || !defaultValues ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <NotificationTemplateForm defaultValues={defaultValues} onSubmit={handleUpdate} />
      )}
    </FormPageLayout>
  );
}
