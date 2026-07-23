// src/features/inventory/vendorContract/pages/VendorContractViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
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

import { getVendorContractByUuid } from "../vendorContract.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";

import type { VendorContractDetail } from "../vendorContract.types";

export default function VendorContractViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("inventory.contracts");

  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<VendorContractDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadVendorContract();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadVendorContract() {
    try {
      const data = await getVendorContractByUuid(uuid!, isTrash);
      setContract(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/inventory/contracts");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!contract) {
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

        <Link component={RouterLink} underline="hover" to="/app/inventory/contracts">
          {t("menu.inventory.contracts")}
        </Link>

        <Typography>{t("common.view")}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("vendorContract.title")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendorContract.code")}</Typography>
              <Typography mt={0.5}>{contract.contract_code}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendorContract.name")}</Typography>
              <Typography mt={0.5}>{contract.contract_name}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendorContract.vendor")}</Typography>
              <Typography mt={0.5}>
                {contract.vendor_name} {contract.vendor_code ? `(${contract.vendor_code})` : ""}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendorContract.type")}</Typography>
              <Typography mt={0.5}>{contract.contract_type || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendorContract.referenceNo")}</Typography>
              <Typography mt={0.5}>{contract.reference_no || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendorContract.status")}</Typography>
              <Typography mt={0.5}>
                <Chip
                  size="small"
                  label={contract.status || t("common.active")}
                  color={contract.status === "Active" || !contract.status ? "success" : "default"}
                />
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendorContract.validFrom")}</Typography>
              <Typography mt={0.5}>{contract.valid_from || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendorContract.validTo")}</Typography>
              <Typography mt={0.5}>{contract.valid_to || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendorContract.currency")}</Typography>
              <Typography mt={0.5}>{contract.currency_code || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("vendorContract.paymentTerms")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {contract.payment_terms || "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("vendorContract.remarks")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {contract.remarks || "-"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate("/app/inventory/contracts")}
            size="large"
          >
            {t("common.back")}
          </Button>

          <Box display="flex" gap={2}>
            {perms.can_edit && !isTrash && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/app/inventory/contracts/${uuid}/edit`)}
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
