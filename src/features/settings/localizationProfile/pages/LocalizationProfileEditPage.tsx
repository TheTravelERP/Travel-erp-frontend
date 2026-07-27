// src/features/settings/localizationProfile/pages/LocalizationProfileEditPage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LocalizationProfileForm from "../components/LocalizationProfileForm";
import type { LocalizationProfileFormInput } from "../localizationProfile.types";
import { getLocalizationProfileByUuid, updateLocalizationProfileByUuid } from "../localizationProfile.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function LocalizationProfileEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.localization_profile");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<LocalizationProfileFormInput>();
  const [versionNo, setVersionNo] = useState<number>();

  useEffect(() => {
    loadProfile();
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadProfile() {
    try {
      const data = await getLocalizationProfileByUuid(uuid!);
      setDefaultValues(data);
      setVersionNo(data.version_no);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/settings/localization-profiles");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: LocalizationProfileFormInput) {
    try {
      await updateLocalizationProfileByUuid(uuid!, { ...data, version_no: versionNo! });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate("/app/settings/localization-profiles");
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
        { label: t("menu.settings.localization_profile"), href: "/app/settings/localization-profiles" },
        { label: t("common.edit") },
      ]}
    >
      {loading || !defaultValues ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <LocalizationProfileForm defaultValues={defaultValues} onSubmit={handleUpdate} />
      )}
    </FormPageLayout>
  );
}
