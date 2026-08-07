// src/features/crm/quotation/pages/QuotationEditPage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import QuotationForm from "../components/QuotationForm";
import type { QuotationDetail, QuotationFormInput } from "../quotation.types";
import { getQuotationByUuid, updateQuotationByUuid } from "../quotation.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function QuotationEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("crm.quotations");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<QuotationDetail>();

  useEffect(() => {
    loadQuotation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadQuotation() {
    try {
      const data = await getQuotationByUuid(uuid!);
      if (data.status !== "Draft" || !data.is_current_version) {
        showSnackbar({ message: t("quotation.onlyDraftEditable"), severity: "error" });
        navigate(`/app/crm/quotations/${uuid}`);
        return;
      }
      setDefaultValues(data);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/crm/quotations");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: QuotationFormInput) {
    try {
      await updateQuotationByUuid(uuid!, { ...data, version_no: defaultValues!.version_no });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate(`/app/crm/quotations/${uuid}`);
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
        { label: t("menu.crm.quotations"), href: "/app/crm/quotations" },
        { label: t("common.edit") },
      ]}
    >
      {loading || !defaultValues ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <QuotationForm defaultValues={defaultValues} onSubmit={handleUpdate} isEditMode />
      )}
    </FormPageLayout>
  );
}
