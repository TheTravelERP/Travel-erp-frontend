// src/features/inventory/inventoryStock/pages/InventoryStockCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import InventoryStockForm from "../components/InventoryStockForm";
import type { InventoryStockFormInput } from "../inventoryStock.types";
import { createInventoryStock } from "../inventoryStock.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function InventoryStockCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("inventory.stock");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: InventoryStockFormInput) {
    try {
      await createInventoryStock(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/inventory/stock");
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
        { label: t("menu.inventory.stock"), href: "/app/inventory/stock" },
        { label: t("common.create") },
      ]}
    >
      <InventoryStockForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
