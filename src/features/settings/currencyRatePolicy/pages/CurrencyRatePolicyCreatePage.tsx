// src/features/settings/currencyRatePolicy/pages/CurrencyRatePolicyCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import CurrencyRatePolicyForm from "../components/CurrencyRatePolicyForm";
import type { CurrencyRatePolicyFormInput } from "../currencyRatePolicy.types";
import { createCurrencyRatePolicy } from "../currencyRatePolicy.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function CurrencyRatePolicyCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.currency_rate_policy");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: CurrencyRatePolicyFormInput) {
    try {
      await createCurrencyRatePolicy(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/settings/currency-rate-policy");
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
        { label: t("menu.settings.currency_rate_policy"), href: "/app/settings/currency-rate-policy" },
        { label: t("common.create") },
      ]}
    >
      <CurrencyRatePolicyForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
