// src/features/inventory/transportCompany/pages/TransportCompanyCreatePage.tsx
import { Box, Breadcrumbs, Link, Paper, Typography } from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import TransportCompanyForm from "../components/TransportCompanyForm";
import type { TransportCompanyFormInput } from "../transportCompany.types";
import { createTransportCompany } from "../transportCompany.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import { Link as RouterLink } from "react-router-dom";

export default function TransportCompanyCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("inventory.vendors");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: TransportCompanyFormInput) {
    try {
      await createTransportCompany(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/inventory/vendors");
    } catch (err: any) {
      showSnackbar({
        message: getErrorMessage(err, t("common.createFailed")),
        severity: "error",
      });
    }
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h6" fontWeight={700}>
        {t("common.create")}
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} to="/app/dashboard" underline="hover">
          {t("menu.dashboard")}
        </Link>
        <Link component={RouterLink} to="/app/inventory/vendors" underline="hover">
          {t("menu.inventory.vendors")}
        </Link>
        <Typography color="text.primary">{t("common.create")}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <TransportCompanyForm onSubmit={handleCreate} />
      </Paper>
    </Box>
  );
}
