// src/features/inventory/productPrice/pages/ProductPriceCreatePage.tsx
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ProductPriceForm from "../components/ProductPriceForm";
import type { ProductPriceFormInput } from "../productPrice.types";
import { createProductPrice } from "../productPrice.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function ProductPriceCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const presetProductUuid = searchParams.get("product_uuid") || undefined;

  const perms = usePermission("inventory.product_price_list");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: ProductPriceFormInput) {
    try {
      await createProductPrice(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate(
        presetProductUuid
          ? `/app/inventory/product-master/${presetProductUuid}`
          : "/app/inventory/product-price-list",
      );
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
        { label: t("menu.inventory.product_price_list"), href: "/app/inventory/product-price-list" },
        { label: t("common.create") },
      ]}
    >
      <ProductPriceForm
        onSubmit={handleCreate}
        defaultValues={presetProductUuid ? { product_uuid: presetProductUuid } : undefined}
        lockProduct={Boolean(presetProductUuid)}
      />
    </FormPageLayout>
  );
}
