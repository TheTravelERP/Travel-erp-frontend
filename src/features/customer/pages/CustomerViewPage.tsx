// src/features/customer/pages/CustomerViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Button,
  Divider,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import {
  Link as RouterLink,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import { getCustomerByUuid } from "../customer.api";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../hooks/usePermission";

import type { CustomerDetail } from "../customer.types";

export default function CustomerViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("crm.customers");

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadCustomer();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadCustomer() {
    try {
      const data = await getCustomerByUuid(uuid!, isTrash);
      setCustomer(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/crm/customers");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!customer) {
    return null;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h6" fontWeight={700}>
        {t("common.view")}
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" to="/app/dashboard">
          {t("menu.dashboard")}
        </Link>

        <Link component={RouterLink} underline="hover" to="/app/crm/customers">
          {t("menu.crm.customers")}
        </Link>

        <Typography>{t("common.view")}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        {/* ================= PERSONAL ================= */}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("settings.personalDetails")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("common.customerName")}</Typography>
              <Typography mt={0.5}>{customer.name || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("common.mobile")}</Typography>
              <Typography mt={0.5}>{customer.mobile || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("common.email")}</Typography>
              <Typography mt={0.5}>{customer.email || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("settings.dateOfBirth")}</Typography>
              <Typography mt={0.5}>{customer.dob || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("settings.gender")}</Typography>
              <Typography mt={0.5}>{customer.gender || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("customer.nationality")}</Typography>
              <Typography mt={0.5}>{customer.nationality || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= PASSPORT ================= */}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("customer.passportDetails")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("customer.passportNumber")}</Typography>
              <Typography mt={0.5}>{customer.passport_no || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("customer.passportIssueDate")}</Typography>
              <Typography mt={0.5}>{customer.passport_issue_date || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("customer.passportExpiryDate")}</Typography>
              <Typography mt={0.5}>{customer.passport_expiry_date || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("customer.passportIssueCountry")}</Typography>
              <Typography mt={0.5}>{customer.passport_issue_country || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= BUSINESS ================= */}

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("customer.businessDetails")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("customer.taxId")}</Typography>
              <Typography mt={0.5}>{customer.gstin || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("customer.billingAddress")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {customer.billing_address || "-"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= FOOTER ================= */}

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate("/app/crm/customers")}
            size="large"
          >
            {t("common.back")}
          </Button>

          <Box display="flex" gap={2}>
            {perms.can_edit && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/app/crm/customers/${uuid}/edit`)}
              >
                {t("common.edit")}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
