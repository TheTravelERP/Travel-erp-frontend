// src/features/settings/taxCode/pages/TaxCodeCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import TaxCodeForm from "../components/TaxCodeForm";
import type { TaxCodeFormInput } from "../taxCode.types";
import { createTaxCode } from "../taxCode.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function TaxCodeCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.tax_code_master");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: TaxCodeFormInput) {
    try {
      await createTaxCode(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/settings/tax-code-master");
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
        { label: t("menu.settings.tax_code_master"), href: "/app/settings/tax-code-master" },
        { label: t("common.create") },
      ]}
    >
      <TaxCodeForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
