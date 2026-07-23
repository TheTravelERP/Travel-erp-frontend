// src/features/inventory/inventoryStock/pages/InventoryStockViewPage.tsx

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

import { getInventoryStockByUuid } from "../inventoryStock.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";

import type { InventoryStockDetail } from "../inventoryStock.types";

const SERVICE_REFERENCE_NAME_MAP: Record<string, keyof InventoryStockDetail> = {
  Hotel: "hotel_name",
  Airline: "airline_name",
  Ziyarat: "ziyarat_name",
  Transport: "vendor_name",
  Visa: "vendor_name",
  Insurance: "vendor_name",
  Guide: "vendor_name",
  Meal: "vendor_name",
  Laundry: "vendor_name",
  Other: "vendor_name",
};

export default function InventoryStockViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("inventory.stock");

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<InventoryStockDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadInventoryStock();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadInventoryStock() {
    try {
      const data = await getInventoryStockByUuid(uuid!, isTrash);
      setItem(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/inventory/stock");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!item) {
    return null;
  }

  const referenceName = item.service_type
    ? item[SERVICE_REFERENCE_NAME_MAP[item.service_type]]
    : undefined;

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h6" fontWeight={700}>
        {t("common.view")}
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" to="/app/dashboard">
          {t("menu.dashboard")}
        </Link>

        <Link component={RouterLink} underline="hover" to="/app/inventory/stock">
          {t("menu.inventory.stock")}
        </Link>

        <Typography>{t("common.view")}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("inventoryStock.title")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("inventoryStock.code")}</Typography>
              <Typography mt={0.5}>{item.inventory_code}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("inventoryStock.name")}</Typography>
              <Typography mt={0.5}>{item.inventory_name}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("inventoryStock.contract")}</Typography>
              <Typography mt={0.5}>
                {item.contract_name} {item.contract_code ? `(${item.contract_code})` : ""}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("inventoryStock.serviceType")}</Typography>
              <Typography mt={0.5}>{item.service_type || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("inventoryStock.serviceReference")}</Typography>
              <Typography mt={0.5}>{referenceName || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendorContract.status")}</Typography>
              <Typography mt={0.5}>
                <Chip
                  size="small"
                  label={item.status || t("common.active")}
                  color={item.status === "Active" || !item.status ? "success" : "default"}
                />
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("inventoryStock.startDate")}</Typography>
              <Typography mt={0.5}>{item.start_date || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("inventoryStock.endDate")}</Typography>
              <Typography mt={0.5}>{item.end_date || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("vendorContract.currency")}</Typography>
              <Typography mt={0.5}>{item.currency_code || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("inventoryStock.quantitiesAndPricing")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 6, md: 2.4 }}>
              <Typography variant="caption">{t("inventoryStock.totalQty")}</Typography>
              <Typography mt={0.5}>{item.total_qty}</Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 2.4 }}>
              <Typography variant="caption">{t("inventoryStock.bookedQty")}</Typography>
              <Typography mt={0.5}>{item.booked_qty ?? 0}</Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 2.4 }}>
              <Typography variant="caption">{t("inventoryStock.blockedQty")}</Typography>
              <Typography mt={0.5}>{item.blocked_qty ?? 0}</Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 2.4 }}>
              <Typography variant="caption">{t("inventoryStock.colAvailableQty")}</Typography>
              <Typography mt={0.5} fontWeight={600}>{item.available_qty}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 2.4 }} />

            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption">{t("inventoryStock.costPrice")}</Typography>
              <Typography mt={0.5}>{item.cost_price ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption">{t("inventoryStock.sellingPrice")}</Typography>
              <Typography mt={0.5}>{item.selling_price ?? "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="caption">{t("vendorContract.remarks")}</Typography>
          <Typography mt={0.5} whiteSpace="pre-wrap">
            {item.remarks || "-"}
          </Typography>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate("/app/inventory/stock")}
            size="large"
          >
            {t("common.back")}
          </Button>

          <Box display="flex" gap={2}>
            {perms.can_edit && !isTrash && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/app/inventory/stock/${uuid}/edit`)}
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
