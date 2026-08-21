// src/features/inventory/productPrice/components/ProductPriceForm.tsx

import {
  Box,
  FormControlLabel,
  Grid,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getProductPriceSchema } from "../productPrice.schema";
import type { ProductPriceFormInput } from "../productPrice.types";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";
import FormSection from "../../../../components/forms/FormSection";
import FormActions from "../../../../components/forms/FormActions";

interface ProductPriceFormProps {
  defaultValues?: Partial<ProductPriceFormInput> & { uuid?: string };
  onSubmit: (data: ProductPriceFormInput) => Promise<void>;
  loading?: boolean;
  lockProduct?: boolean;
}

const emptyValues: ProductPriceFormInput = {
  product_uuid: "",
  price_code: "",
  valid_from: "",
  valid_to: "",
  currency_code: "",
  cost_price: "",
  sell_price: "",
  tax_treatment: "",
  remarks: "",
  is_active: true,
  tax_code_uuid: "",
  cost_tax_mode: "",
  sell_tax_mode: "",
};

export default function ProductPriceForm({
  defaultValues,
  onSubmit,
  loading = false,
  lockProduct = false,
}: ProductPriceFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const productPriceSchema = useMemo(() => getProductPriceSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProductPriceFormInput>({
    resolver: zodResolver(productPriceSchema),
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  useEffect(() => {
    if (defaultValues) {
      reset(mergeFormDefaults(emptyValues, defaultValues));
    }
  }, [defaultValues, reset]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit, () =>
        showSnackbar({ message: t("validation.fixHighlightedFields"), severity: "error" }),
      )}
      noValidate
    >
      <Grid container spacing={2}>
        <FormSection title={t("menu.inventory.product_price_list")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="product_uuid"
              label={t("product.title")}
              control={control}
              dropdownName="products"
              disabled={lockProduct}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="price_code"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("productPrice.priceCode")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <EntityAutocomplete
              name="currency_code"
              label={t("productPrice.currency")}
              control={control}
              dropdownName="currency_master"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="valid_from"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("productPrice.validFrom")}
                  type="date"
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="valid_to"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("productPrice.validTo")}
                  type="date"
                  fullWidth
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="cost_price"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("productPrice.costPrice")}
                  type="number"
                  fullWidth
                  required
                  slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="sell_price"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("productPrice.sellPrice")}
                  type="number"
                  fullWidth
                  required
                  slotProps={{ htmlInput: { step: "0.01", min: 0 } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <DropdownAutocomplete
              name="tax_treatment"
              dropdownName="product_price_tax_treatment"
              label={t("productPrice.taxTreatment")}
              control={control}
              useForm
              allowAdd={false}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t("common.active")}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("productPrice.remarks")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>
        </FormSection>

        <FormSection title={t("productPrice.sectionTaxConfiguration")}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="tax_code_uuid"
              label={t("productPrice.taxCode")}
              control={control}
              dropdownName="tax_codes"
              allowAdd={false}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <DropdownAutocomplete
              name="cost_tax_mode"
              dropdownName="tax_calculation_method"
              label={t("productPrice.costTaxMode")}
              control={control}
              useForm
              allowAdd={false}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <DropdownAutocomplete
              name="sell_tax_mode"
              dropdownName="tax_calculation_method"
              label={t("productPrice.sellTaxMode")}
              control={control}
              useForm
              allowAdd={false}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              {t("productPrice.taxConfigurationHelper")}
            </Typography>
          </Grid>
        </FormSection>

        <FormActions
          onBack={() => navigate("/app/inventory/product-price-list")}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
