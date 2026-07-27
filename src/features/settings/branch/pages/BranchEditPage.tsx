// src/features/settings/branch/pages/BranchEditPage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import BranchForm from "../components/BranchForm";
import type { BranchFormInput } from "../branch.types";
import { getBranchByUuid, updateBranchByUuid } from "../branch.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

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

  return (
    <FormPageLayout
      title={t("common.edit")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.settings.branch_master"), href: "/app/settings/branch-master" },
        { label: t("common.edit") },
      ]}
    >
      {loading || !defaultValues ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <BranchForm defaultValues={defaultValues} onSubmit={handleUpdate} isHeadOffice={isHeadOffice} />
      )}
    </FormPageLayout>
  );
}
