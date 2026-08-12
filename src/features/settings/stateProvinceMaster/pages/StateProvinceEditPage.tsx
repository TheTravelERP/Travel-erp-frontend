// src/features/settings/stateProvinceMaster/pages/StateProvinceEditPage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import StateProvinceForm from "../components/StateProvinceForm";
import type { StateProvinceFormInput } from "../stateProvince.types";
import { getStateProvinceByUuid, updateStateProvinceByUuid } from "../stateProvince.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function StateProvinceEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.state_province_master");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<StateProvinceFormInput>();
  const [versionNo, setVersionNo] = useState<number>();

  useEffect(() => {
    loadStateProvince();
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadStateProvince() {
    try {
      const data = await getStateProvinceByUuid(uuid!);
      setDefaultValues(data);
      setVersionNo(data.version_no);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/settings/state-province-master");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: StateProvinceFormInput) {
    try {
      await updateStateProvinceByUuid(uuid!, { ...data, version_no: versionNo! });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate("/app/settings/state-province-master");
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
        { label: t("menu.settings.state_province_master"), href: "/app/settings/state-province-master" },
        { label: t("common.edit") },
      ]}
    >
      {loading || !defaultValues ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <StateProvinceForm defaultValues={defaultValues} onSubmit={handleUpdate} />
      )}
    </FormPageLayout>
  );
}
