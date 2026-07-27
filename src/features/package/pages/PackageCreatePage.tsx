// src/features/package/pages/PackageCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import PackageForm from "../components/PackageForm";
import type { PackageFormInput } from "../package.types";
import { createPackage } from "../package.api";
import { usePermission } from "../../../hooks/usePermission";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../utils/errorMessage";
import FormPageLayout from "../../../components/forms/FormPageLayout";

export default function PackageCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("packages.list");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: PackageFormInput) {
    try {
      await createPackage(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/packages/list");
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
        { label: t("menu.packages.list"), href: "/app/packages/list" },
        { label: t("common.create") },
      ]}
    >
      <PackageForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
