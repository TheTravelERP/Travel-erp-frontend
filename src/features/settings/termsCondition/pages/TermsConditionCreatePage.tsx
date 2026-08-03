// src/features/settings/termsCondition/pages/TermsConditionCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import TermsConditionForm from "../components/TermsConditionForm";
import type { TermsConditionFormInput } from "../termsCondition.types";
import { createTermsCondition } from "../termsCondition.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function TermsConditionCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.terms_conditions_master");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: TermsConditionFormInput) {
    try {
      await createTermsCondition(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/settings/terms-conditions-master");
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
        { label: t("menu.settings.terms_conditions_master"), href: "/app/settings/terms-conditions-master" },
        { label: t("common.create") },
      ]}
    >
      <TermsConditionForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
