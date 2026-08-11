// src/features/crm/quotation/pages/QuotationCreatePage.tsx
import { useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import QuotationForm from "../components/QuotationForm";
import type { QuotationFormInput } from "../quotation.types";
import { createQuotation } from "../quotation.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import { parseLineTaxErrors, type LineTaxError } from "../lineErrorParser";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function QuotationCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const enquiryUuid = searchParams.get("enquiry_uuid") || undefined;

  const perms = usePermission("crm.quotations");
  // Set from the backend's per-line tax-configuration 422 (Task 6) so
  // QuotationForm can render the reason inline against the blocking line
  // instead of only a generic toast. Cleared at the start of every submit
  // attempt so a fixed/resubmitted line doesn't keep a stale error visible.
  const [lineTaxErrors, setLineTaxErrors] = useState<LineTaxError[] | undefined>();

  // Stable reference across re-renders (e.g. one triggered by showSnackbar's
  // own context update) — QuotationForm's defaultValues effect calls reset()
  // whenever this object's identity changes, which would otherwise wipe out
  // validation errors moments after they're set from an unrelated re-render.
  const defaultValues = useMemo(
    () => (enquiryUuid ? { enquiry_uuid: enquiryUuid } : undefined),
    [enquiryUuid],
  );

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: QuotationFormInput) {
    setLineTaxErrors(undefined);
    try {
      const quotation = await createQuotation(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate(`/app/crm/quotations/${quotation.uuid}`);
    } catch (err: any) {
      const message = getErrorMessage(err, t("common.createFailed"));
      const parsed = parseLineTaxErrors(message);
      if (parsed) {
        setLineTaxErrors(parsed);
        showSnackbar({ message: t("quotation.taxConfigRequiredToast"), severity: "error" });
      } else {
        showSnackbar({ message, severity: "error" });
      }
    }
  }

  return (
    <FormPageLayout
      title={t("common.create")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.crm.quotations"), href: "/app/crm/quotations" },
        { label: t("common.create") },
      ]}
    >
      <QuotationForm
        mode={enquiryUuid ? "fromEnquiry" : "standalone"}
        enquiryUuid={enquiryUuid}
        defaultValues={defaultValues}
        onSubmit={handleCreate}
        lineTaxErrors={lineTaxErrors}
      />
    </FormPageLayout>
  );
}
