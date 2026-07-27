// src/features/settings/currencyMaster/pages/CurrencyMasterCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import CurrencyMasterForm from "../components/CurrencyMasterForm";
import type { CurrencyMasterFormInput } from "../currencyMaster.types";
import { createCurrencyMaster } from "../currencyMaster.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function CurrencyMasterCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.currency_master");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: CurrencyMasterFormInput) {
    try {
      await createCurrencyMaster(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/settings/currency-master");
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
        { label: t("menu.settings.currency_master"), href: "/app/settings/currency-master" },
        { label: t("common.create") },
      ]}
    >
      <CurrencyMasterForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
