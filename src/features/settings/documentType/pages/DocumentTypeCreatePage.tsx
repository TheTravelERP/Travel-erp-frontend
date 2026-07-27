// src/features/settings/documentType/pages/DocumentTypeCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import DocumentTypeForm from "../components/DocumentTypeForm";
import type { DocumentTypeFormInput } from "../documentType.types";
import { createDocumentType } from "../documentType.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function DocumentTypeCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.document_type_master");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: DocumentTypeFormInput) {
    try {
      await createDocumentType(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/settings/document-type-master");
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
        { label: t("menu.settings.document_type_master"), href: "/app/settings/document-type-master" },
        { label: t("common.create") },
      ]}
    >
      <DocumentTypeForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
