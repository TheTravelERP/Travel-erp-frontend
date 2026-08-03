// src/features/departure/pages/DepartureCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import DepartureForm from "../components/DepartureForm";
import type { DepartureFormInput } from "../departure.types";
import { createDeparture } from "../departure.api";
import { usePermission } from "../../../hooks/usePermission";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../utils/errorMessage";
import FormPageLayout from "../../../components/forms/FormPageLayout";

export default function DepartureCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("packages.departures");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: DepartureFormInput) {
    try {
      await createDeparture(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/packages/departures");
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
        { label: t("menu.packages.departures"), href: "/app/packages/departures" },
        { label: t("common.create") },
      ]}
    >
      <DepartureForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
