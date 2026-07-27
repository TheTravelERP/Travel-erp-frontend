// src/features/settings/documentNumberSeries/pages/DocumentNumberSeriesEditPage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import DocumentNumberSeriesForm from "../components/DocumentNumberSeriesForm";
import type { DocumentNumberSeriesFormInput } from "../documentNumberSeries.types";
import { getDocumentNumberSeriesByUuid, updateDocumentNumberSeriesByUuid } from "../documentNumberSeries.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function DocumentNumberSeriesEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.doc_numbering");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<DocumentNumberSeriesFormInput>();
  const [isLocked, setIsLocked] = useState(false);
  const [nextNumber, setNextNumber] = useState<number>();

  useEffect(() => {
    loadSeries();
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadSeries() {
    try {
      const data = await getDocumentNumberSeriesByUuid(uuid!);
      setDefaultValues(data);
      setIsLocked(data.is_locked);
      setNextNumber(data.next_number);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/settings/doc-numbering");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: DocumentNumberSeriesFormInput) {
    try {
      await updateDocumentNumberSeriesByUuid(uuid!, data);
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate("/app/settings/doc-numbering");
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
        { label: t("menu.settings.doc_numbering"), href: "/app/settings/doc-numbering" },
        { label: t("common.edit") },
      ]}
    >
      {loading || !defaultValues ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DocumentNumberSeriesForm
          defaultValues={defaultValues}
          onSubmit={handleUpdate}
          isLocked={isLocked}
          nextNumber={nextNumber}
        />
      )}
    </FormPageLayout>
  );
}
