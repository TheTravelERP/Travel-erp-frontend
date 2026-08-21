// src/features/settings/serviceType/pages/ServiceTypeEditPage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ServiceTypeForm from "../components/ServiceTypeForm";
import type { ServiceTypeFormInput } from "../serviceType.types";
import { getServiceTypeByUuid, updateServiceTypeByUuid } from "../serviceType.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function ServiceTypeEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.service_type_master");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<ServiceTypeFormInput>();
  const [versionNo, setVersionNo] = useState<number>();
  const [isSystem, setIsSystem] = useState(false);

  useEffect(() => {
    loadServiceType();
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadServiceType() {
    try {
      const data = await getServiceTypeByUuid(uuid!);
      setDefaultValues(data);
      setVersionNo(data.version_no);
      setIsSystem(data.is_system);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/settings/service-type-master");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: ServiceTypeFormInput) {
    try {
      await updateServiceTypeByUuid(uuid!, { ...data, version_no: versionNo! });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate("/app/settings/service-type-master");
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
        { label: t("menu.settings.service_type_master"), href: "/app/settings/service-type-master" },
        { label: t("common.edit") },
      ]}
    >
      {loading || !defaultValues ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ServiceTypeForm defaultValues={defaultValues} onSubmit={handleUpdate} isSystem={isSystem} />
      )}
    </FormPageLayout>
  );
}
