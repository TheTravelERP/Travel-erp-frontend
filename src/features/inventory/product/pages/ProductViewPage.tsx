// src/features/inventory/product/pages/ProductViewPage.tsx

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

import { getProductByUuid } from "../product.api";
import { getProductPrices } from "../../productPrice/productPrice.api";
import type { ProductPriceListItem } from "../../productPrice/productPrice.types";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

import type { ProductDetail } from "../product.types";

export default function ProductViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("inventory.product_master");
  const pricePerms = usePermission("inventory.product_price_list");

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [prices, setPrices] = useState<ProductPriceListItem[]>([]);

  useEffect(() => {
    if (uuid) {
      loadProduct();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadProduct() {
    try {
      const data = await getProductByUuid(uuid!, isTrash);
      setProduct(data);

      if (pricePerms.can_view) {
        const priceRes = await getProductPrices({ product_uuid: uuid!, page: 1, page_size: 50 });
        setPrices(priceRes.data);
      }
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/inventory/product-master");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!product) {
    return null;
  }

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.inventory.product_master"), href: "/app/inventory/product-master" },
        { label: t("common.view") },
      ]}
    >
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
          {t("menu.inventory.product_master")}
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("product.code")}</Typography>
            <Typography mt={0.5}>{product.product_code}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("product.name")}</Typography>
            <Typography mt={0.5}>{product.product_name}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("common.status")}</Typography>
            <Box mt={0.5}>
              <Chip
                size="small"
                label={product.is_active ? t("common.active") : t("common.inactive")}
                color={product.is_active ? "success" : "default"}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("product.location")}</Typography>
            <Typography mt={0.5}>
              {product.location_name} {product.location_code ? `(${product.location_code})` : ""}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("product.serviceType")}</Typography>
            <Typography mt={0.5}>{product.service_type_name}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("product.vendor")}</Typography>
            <Typography mt={0.5}>
              {product.vendor_name} {product.vendor_code ? `(${product.vendor_code})` : ""}
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="caption">{t("common.description")}</Typography>
            <Typography mt={0.5} whiteSpace="pre-wrap">
              {product.description || "-"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {pricePerms.can_view && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" color="primary">
              {t("menu.inventory.product_price_list")}
            </Typography>
            {pricePerms.can_create && !isTrash && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate(`/app/inventory/product-price-list/create?product_uuid=${uuid}`)}
              >
                {t("common.add")}
              </Button>
            )}
          </Box>

          {prices.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("productPrice.noPricesYet")}
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("productPrice.colPriceCode")}</TableCell>
                    <TableCell>{t("productPrice.colValidFrom")}</TableCell>
                    <TableCell>{t("productPrice.colValidTo")}</TableCell>
                    <TableCell>{t("productPrice.currency")}</TableCell>
                    <TableCell align="right">{t("productPrice.costPrice")}</TableCell>
                    <TableCell align="right">{t("productPrice.sellPrice")}</TableCell>
                    <TableCell>{t("common.status")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {prices.map((p) => (
                    <TableRow
                      key={p.uuid}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/app/inventory/product-price-list/${p.uuid}`)}
                    >
                      <TableCell>{p.price_code}</TableCell>
                      <TableCell>{p.valid_from}</TableCell>
                      <TableCell>{p.valid_to}</TableCell>
                      <TableCell>{p.currency_code}</TableCell>
                      <TableCell align="right">{p.cost_price}</TableCell>
                      <TableCell align="right">{p.sell_price}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={p.is_active ? t("common.active") : t("common.inactive")}
                          color={p.is_active ? "success" : "default"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      <Divider sx={{ my: 3 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button
          variant="outlined"
          onClick={() => navigate("/app/inventory/product-master")}
          size="large"
        >
          {t("common.back")}
        </Button>

        <Box display="flex" gap={2}>
          {perms.can_edit && !isTrash && (
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(`/app/inventory/product-master/${uuid}/edit`)}
            >
              {t("common.edit")}
            </Button>
          )}
        </Box>
      </Box>
    </FormPageLayout>
  );
}
