// src/features/settings/documentType/pages/DocumentTypeEditPage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import DocumentTypeForm from "../components/DocumentTypeForm";
import type { DocumentTypeFormInput } from "../documentType.types";
import { getDocumentTypeByUuid, updateDocumentTypeByUuid } from "../documentType.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function DocumentTypeEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.document_type_master");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<DocumentTypeFormInput>();
  const [versionNo, setVersionNo] = useState<number>();
  const [isSystem, setIsSystem] = useState(false);

  useEffect(() => {
    loadDocumentType();
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadDocumentType() {
    try {
      const data = await getDocumentTypeByUuid(uuid!);
      setDefaultValues(data);
      setVersionNo(data.version_no);
      setIsSystem(data.is_system);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/settings/document-type-master");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: DocumentTypeFormInput) {
    try {
      await updateDocumentTypeByUuid(uuid!, { ...data, version_no: versionNo! });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate("/app/settings/document-type-master");
    } catch (err: any) {
      if (err?.response?.status === 409) {
        showSnackbar({
          message: getErrorMessage(err, t("common.updateConflict")),
          severity: "error",
        });
        return;
      }

      showSnackbar({
        message: getErrorMessage(err, t("common.updateFailed")),
        severity: "error",
      });
    }
  }

  return (
    <FormPageLayout
      title={t("common.edit")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.settings.document_type_master"), href: "/app/settings/document-type-master" },
        { label: t("common.edit") },
      ]}
    >
      {loading || !defaultValues ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DocumentTypeForm defaultValues={defaultValues} onSubmit={handleUpdate} isSystem={isSystem} />
      )}
    </FormPageLayout>
  );
}
