// src/features/inventory/vendor/pages/VendorCreatePage.tsx
import { Box, Breadcrumbs, Link, Paper, Typography } from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import VendorForm from "../components/VendorForm";
import type { VendorFormInput } from "../vendor.types";
import { createVendor } from "../vendor.api";
import { usePermission } from "../../../../hooks/usePermission";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import { Link as RouterLink } from "react-router-dom";

export default function VendorCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("inventory.vendor_master");

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: VendorFormInput) {
    try {
      await createVendor(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate("/app/inventory/vendor-master");
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
        <Link component={RouterLink} to="/app/inventory/vendor-master" underline="hover">
          {t("menu.inventory.vendor_master")}
        </Link>
        <Typography color="text.primary">{t("common.create")}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <VendorForm onSubmit={handleCreate} />
      </Paper>
    </Box>
  );
}
