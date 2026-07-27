// src/features/settings/taxRegistration/pages/TaxRegistrationEditPage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import TaxRegistrationForm from "../components/TaxRegistrationForm";
import type { TaxRegistrationFormInput } from "../taxRegistration.types";
import { getTaxRegistrationByUuid, updateTaxRegistrationByUuid } from "../taxRegistration.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function TaxRegistrationEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.tax_registration");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<TaxRegistrationFormInput>();
  const [versionNo, setVersionNo] = useState<number>();

  useEffect(() => {
    loadTaxRegistration();
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadTaxRegistration() {
    try {
      const data = await getTaxRegistrationByUuid(uuid!);
      setDefaultValues(data);
      setVersionNo(data.version_no);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/settings/tax-registration");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: TaxRegistrationFormInput) {
    try {
      await updateTaxRegistrationByUuid(uuid!, { ...data, version_no: versionNo! });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate("/app/settings/tax-registration");
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
        { label: t("menu.settings.tax_registration"), href: "/app/settings/tax-registration" },
        { label: t("common.edit") },
      ]}
    >
      {loading || !defaultValues ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TaxRegistrationForm defaultValues={defaultValues} onSubmit={handleUpdate} />
      )}
    </FormPageLayout>
  );
}
