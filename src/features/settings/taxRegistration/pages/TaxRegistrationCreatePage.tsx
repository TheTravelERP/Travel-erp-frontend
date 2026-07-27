// src/features/settings/taxRegistration/pages/TaxRegistrationCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import TaxRegistrationForm from "../components/TaxRegistrationForm";
import type { TaxRegistrationFormInput } from "../taxRegistration.types";
import { createTaxRegistration } from "../taxRegistration.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function TaxRegistrationCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.tax_registration");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: TaxRegistrationFormInput) {
    try {
      await createTaxRegistration(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/settings/tax-registration");
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
        { label: t("menu.settings.tax_registration"), href: "/app/settings/tax-registration" },
        { label: t("common.create") },
      ]}
    >
      <TaxRegistrationForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
