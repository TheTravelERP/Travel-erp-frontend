// src/features/settings/communicationProviders/pages/CommunicationProviderEditPage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import CommunicationProviderForm from "../components/CommunicationProviderForm";
import type { CommunicationProviderDetail, CommunicationProviderFormInput } from "../communicationProvider.types";
import { getCommunicationProviderByUuid, updateCommunicationProviderByUuid } from "../communicationProvider.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function CommunicationProviderEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.communication_settings");

  const [loading, setLoading] = useState(true);
  const [existing, setExisting] = useState<CommunicationProviderDetail>();

  useEffect(() => {
    loadProvider();
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadProvider() {
    try {
      const data = await getCommunicationProviderByUuid(uuid!);
      setExisting(data);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/settings/communication-settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: CommunicationProviderFormInput) {
    try {
      await updateCommunicationProviderByUuid(uuid!, { ...data, version_no: existing!.version_no });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate("/app/settings/communication-settings");
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
        { label: t("menu.settings.communication_settings"), href: "/app/settings/communication-settings" },
        { label: t("common.edit") },
      ]}
    >
      {loading || !existing ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <CommunicationProviderForm defaultValues={existing} existing={existing} onSubmit={handleUpdate} />
      )}
    </FormPageLayout>
  );
}
