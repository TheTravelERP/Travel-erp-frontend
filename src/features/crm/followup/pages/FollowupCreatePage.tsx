// src/features/crm/followup/pages/FollowupCreatePage.tsx
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import FollowupForm from "../components/FollowupForm";
import type { FollowupFormInput } from "../followup.types";
import { createFollowup } from "../followup.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function FollowupCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const perms = usePermission("crm.followups");

  // Carries the Enquiry context through from wherever this page was opened —
  // the standalone list page's "Add Follow-up" (with an enquiry already
  // filtered) or the Enquiry Workspace's Follow-ups tab.
  const lockedEnquiryUuid = searchParams.get("enquiry_uuid") || undefined;
  const backTo = lockedEnquiryUuid
    ? `/app/crm/followups?enquiry_uuid=${lockedEnquiryUuid}`
    : "/app/crm/followups";

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: FollowupFormInput) {
    try {
      await createFollowup(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate(backTo);
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
        { label: t("menu.crm.followups"), href: "/app/crm/followups" },
        { label: t("common.create") },
      ]}
    >
      <FollowupForm onSubmit={handleCreate} lockedEnquiryUuid={lockedEnquiryUuid} backTo={backTo} />
    </FormPageLayout>
  );
}
