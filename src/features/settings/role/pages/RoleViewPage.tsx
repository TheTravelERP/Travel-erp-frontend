// src/features/settings/role/pages/RoleViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getRoleByUuid } from "../role.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

import type { RoleDetail } from "../role.types";

export default function RoleViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.permissions");

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<RoleDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadRole();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadRole() {
    try {
      const data = await getRoleByUuid(uuid!, isTrash);
      setRole(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/settings/roles");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!role) {
    return null;
  }

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.settings.permissions"), href: "/app/settings/roles" },
        { label: t("common.view") },
      ]}
    >
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h6" color="primary">
              {t("role.title")}
            </Typography>
            {role.is_system && <Chip size="small" label={t("role.system")} />}
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("role.code")}</Typography>
              <Typography mt={0.5}>{role.role_code}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("role.name")}</Typography>
              <Typography mt={0.5}>{role.role_name}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("common.status")}</Typography>
              <Typography mt={0.5}>
                <Chip
                  size="small"
                  label={role.is_active ? t("common.active") : t("common.inactive")}
                  color={role.is_active ? "success" : "default"}
                />
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("common.description")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {role.description || "-"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate("/app/settings/roles")}
            size="large"
          >
            {t("common.back")}
          </Button>

          <Box display="flex" gap={2}>
            {perms.can_edit && !isTrash && (
              <>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate(`/app/settings/roles/${uuid}/permissions`)}
                >
                  {t("role.permissions")}
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate(`/app/settings/roles/${uuid}/edit`)}
                >
                  {t("common.edit")}
                </Button>
              </>
            )}
          </Box>
        </Box>
    </FormPageLayout>
  );
}
