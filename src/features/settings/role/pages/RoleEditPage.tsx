// src/features/settings/role/pages/RoleEditPage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import RoleForm from "../components/RoleForm";
import type { RoleFormInput } from "../role.types";
import { getRoleByUuid, updateRoleByUuid } from "../role.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function RoleEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.permissions");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<RoleFormInput>();
  const [versionNo, setVersionNo] = useState<number>();
  const [isSystem, setIsSystem] = useState(false);

  useEffect(() => {
    loadRole();
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadRole() {
    try {
      const data = await getRoleByUuid(uuid!);
      setDefaultValues(data);
      setVersionNo(data.version_no);
      setIsSystem(data.is_system);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/settings/roles");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: RoleFormInput) {
    try {
      await updateRoleByUuid(uuid!, { ...data, version_no: versionNo! });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate("/app/settings/roles");
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
        { label: t("menu.settings.permissions"), href: "/app/settings/roles" },
        { label: t("common.edit") },
      ]}
    >
      {loading || !defaultValues ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <RoleForm defaultValues={defaultValues} onSubmit={handleUpdate} isSystem={isSystem} />
      )}
    </FormPageLayout>
  );
}
