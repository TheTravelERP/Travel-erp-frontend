// src/features/package/packagePricing/pages/PackagePricingCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import PackagePricingForm from "../components/PackagePricingForm";
import type { PackagePricingFormInput } from "../packagePricing.types";
import { createPackagePricing } from "../packagePricing.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function PackagePricingCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("packages.pricing");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: PackagePricingFormInput) {
    try {
      await createPackagePricing(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/packages/pricing");
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
        { label: t("menu.packages.pricing"), href: "/app/packages/pricing" },
        { label: t("common.create") },
      ]}
    >
      <PackagePricingForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
