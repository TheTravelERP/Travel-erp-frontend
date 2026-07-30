// src/features/settings/documentTemplates/pages/DocumentTemplateConfigCreatePage.tsx
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import DocumentTemplateConfigForm from "../components/DocumentTemplateConfigForm";
import type { DocumentTemplateConfigFormInput } from "../documentTemplateConfig.types";
import { createDocumentTemplateConfig } from "../documentTemplateConfig.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function DocumentTemplateConfigCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.document_template_config");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: DocumentTemplateConfigFormInput) {
    try {
      await createDocumentTemplateConfig(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/settings/document-templates/config");
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
        { label: t("menu.settings.document_template_config"), href: "/app/settings/document-templates/config" },
        { label: t("common.create") },
      ]}
    >
      <DocumentTemplateConfigForm onSubmit={handleCreate} />
    </FormPageLayout>
  );
}
