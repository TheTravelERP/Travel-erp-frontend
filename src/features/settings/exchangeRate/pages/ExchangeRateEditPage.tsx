// src/features/settings/exchangeRate/pages/ExchangeRateEditPage.tsx
import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ExchangeRateForm from "../components/ExchangeRateForm";
import type { ExchangeRateFormInput } from "../exchangeRate.types";
import { getExchangeRateByUuid, updateExchangeRateByUuid } from "../exchangeRate.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

export default function ExchangeRateEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.exchange_rate_master");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<ExchangeRateFormInput>();
  const [versionNo, setVersionNo] = useState<number>();

  useEffect(() => {
    loadExchangeRate();
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadExchangeRate() {
    try {
      const data = await getExchangeRateByUuid(uuid!);
      setDefaultValues(data);
      setVersionNo(data.version_no);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/settings/exchange-rate-master");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: ExchangeRateFormInput) {
    try {
      await updateExchangeRateByUuid(uuid!, { ...data, version_no: versionNo! });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate("/app/settings/exchange-rate-master");
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
        { label: t("menu.settings.exchange_rate_master"), href: "/app/settings/exchange-rate-master" },
        { label: t("common.edit") },
      ]}
    >
      {loading || !defaultValues ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ExchangeRateForm defaultValues={defaultValues} onSubmit={handleUpdate} />
      )}
    </FormPageLayout>
  );
}
