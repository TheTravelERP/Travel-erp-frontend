// src/features/settings/currencyRatePolicy/pages/CurrencyRatePolicyEditPage.tsx
import { useEffect, useState } from "react";
import { Box, Breadcrumbs, Link, Paper, Typography } from "@mui/material";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import CurrencyRatePolicyForm from "../components/CurrencyRatePolicyForm";
import type { CurrencyRatePolicyFormInput } from "../currencyRatePolicy.types";
import { getCurrencyRatePolicyByUuid, updateCurrencyRatePolicyByUuid } from "../currencyRatePolicy.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

export default function CurrencyRatePolicyEditPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.currency_rate_policy");

  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<CurrencyRatePolicyFormInput>();
  const [versionNo, setVersionNo] = useState<number>();

  useEffect(() => {
    loadPolicy();
  }, []);

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadPolicy() {
    try {
      const data = await getCurrencyRatePolicyByUuid(uuid!);
      setDefaultValues(data);
      setVersionNo(data.version_no);
    } catch {
      showSnackbar({ message: t("common.loadFailed"), severity: "error" });
      navigate("/app/settings/currency-rate-policy");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: CurrencyRatePolicyFormInput) {
    try {
      await updateCurrencyRatePolicyByUuid(uuid!, { ...data, version_no: versionNo! });
      showSnackbar({ message: t("common.updatedSuccess"), severity: "success" });
      navigate("/app/settings/currency-rate-policy");
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

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h6" fontWeight={700}>
        {t("common.edit")}
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/app/dashboard" underline="hover">
          {t("menu.dashboard")}
        </Link>
        <Link component={RouterLink} to="/app/settings/currency-rate-policy" underline="hover">
          {t("menu.settings.currency_rate_policy")}
        </Link>
        <Typography color="text.primary">{t("common.edit")}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        <CurrencyRatePolicyForm defaultValues={defaultValues} onSubmit={handleUpdate} />
      </Paper>
    </Box>
  );
}
