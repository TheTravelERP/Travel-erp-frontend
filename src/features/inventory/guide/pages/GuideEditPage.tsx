// src/features/inventory/guide/pages/GuideEditPage.tsx
import { useEffect, useState } from "react";
import { Box, Breadcrumbs, Link, Paper, Typography } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import GuideForm from "../components/GuideForm";
import type { GuideFormInput } from "../guide.types";
import { getGuideByUuid, updateGuideByUuid } from "../guide.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

export default function GuideEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("inventory.guides");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<GuideFormInput>();
  const [versionNo, setVersionNo] = useState<number>();

  useEffect(() => {
    loadGuide();
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadGuide() {
    try {
      const data = await getGuideByUuid(uuid!);
      setDefaultValues(data);
      setVersionNo(data.version_no);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/inventory/guides");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: GuideFormInput) {
    try {
      await updateGuideByUuid(uuid!, { ...data, version_no: versionNo! });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate("/app/inventory/guides");
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
        <Link component={RouterLink} to="/app/inventory/guides" underline="hover">
          {t("menu.inventory.guides")}
        </Link>
        <Typography color="text.primary">{t("common.edit")}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        <GuideForm defaultValues={defaultValues} onSubmit={handleUpdate} />
      </Paper>
    </Box>
  );
}
