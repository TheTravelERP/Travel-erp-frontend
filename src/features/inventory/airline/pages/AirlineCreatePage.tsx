// src/features/inventory/airline/pages/AirlineCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import AirlineForm from "../components/AirlineForm";
import type { AirlineFormInput } from "../airline.types";
import { createAirline } from "../airline.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function AirlineCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("inventory.airlines");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: AirlineFormInput) {
    try {
      await createAirline(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/inventory/airlines");
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
        { label: t("menu.inventory.airlines"), href: "/app/inventory/airlines" },
        { label: t("common.create") },
      ]}
    >
      <AirlineForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
