// src/features/settings/localizationProfile/pages/LocalizationProfileCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import LocalizationProfileForm from "../components/LocalizationProfileForm";
import type { LocalizationProfileFormInput } from "../localizationProfile.types";
import { createLocalizationProfile } from "../localizationProfile.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function LocalizationProfileCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.localization_profile");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: LocalizationProfileFormInput) {
    try {
      await createLocalizationProfile(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/settings/localization-profiles");
    } catch (err: any) {
      showSnackbar({
        message: getErrorMessage(err, t("common.createFailed")),
        severity: "error",
      });
    }
  }

  return (
    <FormPageLayout
      title={t("common.create")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.settings.localization_profile"), href: "/app/settings/localization-profiles" },
        { label: t("common.create") },
      ]}
    >
      <LocalizationProfileForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
