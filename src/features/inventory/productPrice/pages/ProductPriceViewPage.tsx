// src/features/inventory/productPrice/pages/ProductPriceViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getProductPriceByUuid } from "../productPrice.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

import type { ProductPriceDetail } from "../productPrice.types";

export default function ProductPriceViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  // "system_default" shows what it actually resolved to (e.g. "System
  // Default -> Exclusive") — explicit Inclusive/Exclusive just shows itself.
  function taxModeLabel(rawMode?: string, effectiveMode?: string): string {
    if (rawMode === "system_default") {
      const resolved = effectiveMode === "inclusive" ? t("productPrice.inclusive") : t("productPrice.exclusive");
      return `${t("productPrice.systemDefault")} → ${resolved}`;
    }
    return rawMode === "inclusive" ? t("productPrice.inclusive") : t("productPrice.exclusive");
  }

  const perms = usePermission("inventory.product_price_list");

  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState<ProductPriceDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadProductPrice();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadProductPrice() {
    try {
      const data = await getProductPriceByUuid(uuid!, isTrash);
      setPrice(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/inventory/product-price-list");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!price) {
    return null;
  }

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.inventory.product_price_list"), href: "/app/inventory/product-price-list" },
        { label: t("common.view") },
      ]}
    >
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
          {t("menu.inventory.product_price_list")}
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("product.title")}</Typography>
            <Typography mt={0.5}>
              {price.product_name} {price.product_code ? `(${price.product_code})` : ""}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("productPrice.priceCode")}</Typography>
            <Typography mt={0.5}>{price.price_code}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("common.status")}</Typography>
            <Box mt={0.5}>
              <Chip
                size="small"
                label={price.is_active ? t("common.active") : t("common.inactive")}
                color={price.is_active ? "success" : "default"}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("productPrice.validFrom")}</Typography>
            <Typography mt={0.5}>{price.valid_from}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("productPrice.validTo")}</Typography>
            <Typography mt={0.5}>{price.valid_to}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("productPrice.currency")}</Typography>
            <Typography mt={0.5}>
              {price.currency_name} {price.currency_code ? `(${price.currency_code})` : ""}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("productPrice.costPrice")}</Typography>
            <Typography mt={0.5}>{price.cost_price}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("productPrice.sellPrice")}</Typography>
            <Typography mt={0.5}>{price.sell_price}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("productPrice.taxTreatment")}</Typography>
            <Typography mt={0.5}>{price.tax_treatment || "-"}</Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="caption">{t("productPrice.remarks")}</Typography>
            <Typography mt={0.5} whiteSpace="pre-wrap">
              {price.remarks || "-"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
          {t("productPrice.sectionTaxConfiguration")}
        </Typography>

        {!price.tax_code_code ? (
          <Typography variant="body2" color="text.secondary">
            {t("productPrice.noTaxConfigured")}
          </Typography>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption">{t("productPrice.taxCode")}</Typography>
                <Typography mt={0.5}>{price.tax_code_code}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption">{t("productPrice.taxName")}</Typography>
                <Typography mt={0.5}>{price.tax_code_name}</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption">{t("productPrice.taxRate")}</Typography>
                <Typography mt={0.5}>{price.tax_code_rate}%</Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="caption">{t("productPrice.taxType")}</Typography>
                <Typography mt={0.5}>{price.tax_code_tax_type}</Typography>
              </Grid>
            </Grid>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>{t("productPrice.taxMode")}</TableCell>
                    <TableCell align="right">{t("productPrice.netAmount")}</TableCell>
                    <TableCell align="right">{t("productPrice.taxAmount")}</TableCell>
                    <TableCell align="right">{t("productPrice.grossAmount")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{t("productPrice.costPrice")}</TableCell>
                    <TableCell>
                      <Chip size="small" label={taxModeLabel(price.cost_tax_mode, price.effective_cost_tax_mode)} />
                    </TableCell>
                    <TableCell align="right">{price.cost_net_price}</TableCell>
                    <TableCell align="right">{price.cost_tax_amount}</TableCell>
                    <TableCell align="right">
                      <strong>{price.cost_gross_price}</strong>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{t("productPrice.sellPrice")}</TableCell>
                    <TableCell>
                      <Chip size="small" label={taxModeLabel(price.sell_tax_mode, price.effective_sell_tax_mode)} />
                    </TableCell>
                    <TableCell align="right">{price.sell_net_price}</TableCell>
                    <TableCell align="right">{price.sell_tax_amount}</TableCell>
                    <TableCell align="right">
                      <strong>{price.sell_gross_price}</strong>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button
          variant="outlined"
          onClick={() => navigate("/app/inventory/product-price-list")}
          size="large"
        >
          {t("common.back")}
        </Button>

        <Box display="flex" gap={2}>
          {perms.can_edit && !isTrash && (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(`/app/inventory/product-price-list/${uuid}/edit`)}
            >
              {t("common.edit")}
            </Button>
          )}
        </Box>
      </Box>
    </FormPageLayout>
  );
}
