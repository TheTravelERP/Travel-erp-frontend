// src/features/settings/documentTemplates/pages/DocumentTemplateConfigEditPage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import DocumentTemplateConfigForm from "../components/DocumentTemplateConfigForm";
import type { DocumentTemplateConfigFormInput } from "../documentTemplateConfig.types";
import {
  getDocumentTemplateConfigByUuid,
  updateDocumentTemplateConfigByUuid,
} from "../documentTemplateConfig.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function DocumentTemplateConfigEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.document_template_config");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<
    (DocumentTemplateConfigFormInput & { version_no: number }) | undefined
  >();

  useEffect(() => {
    loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadConfig() {
    try {
      const data = await getDocumentTemplateConfigByUuid(uuid!);
      setDefaultValues(data);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/settings/document-templates/config");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: DocumentTemplateConfigFormInput) {
    try {
      await updateDocumentTemplateConfigByUuid(uuid!, { ...data, version_no: defaultValues!.version_no } as any);
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate("/app/settings/document-templates/config");
    } catch (err: any) {
      if (err?.response?.status === 409) {
        showSnackbar({ message: getErrorMessage(err, t("common.updateConflict")), severity: "error" });
        return;
      }
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    }
  }

  return (
    <FormPageLayout
      title={t("common.edit")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.settings.document_template_config"), href: "/app/settings/document-templates/config" },
        { label: t("common.edit") },
      ]}
    >
      {loading || !defaultValues ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DocumentTemplateConfigForm defaultValues={defaultValues} onSubmit={handleUpdate} isEdit />
      )}
    </FormPageLayout>
  );
}
