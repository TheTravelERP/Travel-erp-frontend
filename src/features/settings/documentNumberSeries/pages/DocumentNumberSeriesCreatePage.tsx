// src/features/settings/documentNumberSeries/pages/DocumentNumberSeriesCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import DocumentNumberSeriesForm from "../components/DocumentNumberSeriesForm";
import type { DocumentNumberSeriesFormInput } from "../documentNumberSeries.types";
import { createDocumentNumberSeries } from "../documentNumberSeries.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function DocumentNumberSeriesCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.doc_numbering");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: DocumentNumberSeriesFormInput) {
    try {
      await createDocumentNumberSeries(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/settings/doc-numbering");
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
        { label: t("menu.settings.doc_numbering"), href: "/app/settings/doc-numbering" },
        { label: t("common.create") },
      ]}
    >
      <DocumentNumberSeriesForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
