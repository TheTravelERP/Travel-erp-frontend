// src/features/settings/role/pages/RoleEditPage.tsx
import { useEffect, useState } from "react";
import { Box, Breadcrumbs, Link, Paper, Typography } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import RoleForm from "../components/RoleForm";
import type { RoleFormInput } from "../role.types";
import { getRoleByUuid, updateRoleByUuid } from "../role.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

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

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h6" fontWeight={700}>
        {t("common.edit")}
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/app/dashboard" underline="hover">
          {t("menu.dashboard")}
        </Link>
        <Link component={RouterLink} to="/app/settings/roles" underline="hover">
          {t("menu.settings.permissions")}
        </Link>
        <Typography color="text.primary">{t("common.edit")}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        <RoleForm defaultValues={defaultValues} onSubmit={handleUpdate} isSystem={isSystem} />
      </Paper>
    </Box>
  );
}
