// src/features/settings/branch/pages/BranchEditPage.tsx
import { useEffect, useState } from "react";
import { Box, Breadcrumbs, Link, Paper, Typography } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import BranchForm from "../components/BranchForm";
import type { BranchFormInput } from "../branch.types";
import { getBranchByUuid, updateBranchByUuid } from "../branch.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

export default function BranchEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.branch_master");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<BranchFormInput>();
  const [versionNo, setVersionNo] = useState<number>();
  const [isHeadOffice, setIsHeadOffice] = useState(false);

  useEffect(() => {
    loadBranch();
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadBranch() {
    try {
      const data = await getBranchByUuid(uuid!);
      setDefaultValues(data);
      setVersionNo(data.version_no);
      setIsHeadOffice(data.is_head_office);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/settings/branch-master");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: BranchFormInput) {
    try {
      await updateBranchByUuid(uuid!, { ...data, version_no: versionNo! });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate("/app/settings/branch-master");
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
        <Link component={RouterLink} to="/app/settings/branch-master" underline="hover">
          {t("menu.settings.branch_master")}
        </Link>
        <Typography color="text.primary">{t("common.edit")}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        <BranchForm defaultValues={defaultValues} onSubmit={handleUpdate} isHeadOffice={isHeadOffice} />
      </Paper>
    </Box>
  );
}
