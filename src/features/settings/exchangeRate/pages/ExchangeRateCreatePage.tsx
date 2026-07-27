// src/features/settings/exchangeRate/pages/ExchangeRateCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ExchangeRateForm from "../components/ExchangeRateForm";
import type { ExchangeRateFormInput } from "../exchangeRate.types";
import { createExchangeRate } from "../exchangeRate.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function ExchangeRateCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.exchange_rate_master");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: ExchangeRateFormInput) {
    try {
      await createExchangeRate(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/settings/exchange-rate-master");
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
        { label: t("menu.settings.exchange_rate_master"), href: "/app/settings/exchange-rate-master" },
        { label: t("common.create") },
      ]}
    >
      <ExchangeRateForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
