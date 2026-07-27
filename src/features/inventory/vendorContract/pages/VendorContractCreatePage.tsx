// src/features/inventory/vendorContract/pages/VendorContractCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import VendorContractForm from "../components/VendorContractForm";
import type { VendorContractFormInput } from "../vendorContract.types";
import { createVendorContract } from "../vendorContract.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function VendorContractCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("inventory.contracts");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: VendorContractFormInput) {
    try {
      await createVendorContract(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/inventory/contracts");
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
        { label: t("menu.inventory.contracts"), href: "/app/inventory/contracts" },
        { label: t("common.create") },
      ]}
    >
      <VendorContractForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
