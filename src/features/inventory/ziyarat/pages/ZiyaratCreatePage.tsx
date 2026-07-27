// src/features/inventory/ziyarat/pages/ZiyaratCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ZiyaratForm from "../components/ZiyaratForm";
import type { ZiyaratFormInput } from "../ziyarat.types";
import { createZiyarat } from "../ziyarat.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function ZiyaratCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("inventory.ziyarat");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: ZiyaratFormInput) {
    try {
      await createZiyarat(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/inventory/ziyarat");
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
        { label: t("menu.inventory.ziyarat"), href: "/app/inventory/ziyarat" },
        { label: t("common.create") },
      ]}
    >
      <ZiyaratForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
