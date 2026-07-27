// src/features/inventory/vendor/pages/VendorCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import VendorForm from "../components/VendorForm";
import type { VendorFormInput } from "../vendor.types";
import { createVendor } from "../vendor.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function VendorCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("inventory.vendor_master");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: VendorFormInput) {
    try {
      await createVendor(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/inventory/vendor-master");
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
        { label: t("menu.inventory.vendor_master"), href: "/app/inventory/vendor-master" },
        { label: t("common.create") },
      ]}
    >
      <VendorForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
