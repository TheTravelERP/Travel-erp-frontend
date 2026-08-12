// src/features/settings/stateProvinceMaster/pages/StateProvinceCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import StateProvinceForm from "../components/StateProvinceForm";
import type { StateProvinceFormInput } from "../stateProvince.types";
import { createStateProvince } from "../stateProvince.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function StateProvinceCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.state_province_master");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: StateProvinceFormInput) {
    try {
      await createStateProvince(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/settings/state-province-master");
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
        { label: t("menu.settings.state_province_master"), href: "/app/settings/state-province-master" },
        { label: t("common.create") },
      ]}
    >
      <StateProvinceForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
