// src/features/inventory/productPrice/components/ProductPriceFilters.tsx

import { Box, Button, Grid, MenuItem, TextField, Typography, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import QuickDateRangeFilter from "../../../../components/common/QuickDateRangeFilter";

export interface ProductPriceFilterValues {
  search?: string;
  product_uuid?: string;
  currency_code?: string;
  is_active?: string;
  from_date?: string;
  to_date?: string;
}

interface ProductPriceFiltersProps {
  value: ProductPriceFilterValues;
  onChange: (v: Partial<ProductPriceFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function ProductPriceFilters({
  value,
  onChange,
  onApply,
  onReset,
}: ProductPriceFiltersProps) {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "grey.50",
        borderRadius: 2,
        mb: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={1.5} mb={2}>
        <Typography variant="h6" color="primary">
          {t("common.filters")}
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <QuickDateRangeFilter
          fromDate={value.from_date}
          toDate={value.to_date}
          onChange={onChange}
        />

        <Grid size={{ xs: 12, md: 4 }}>
          <EntityAutocomplete
            name="product_uuid"
            label={t("product.title")}
            dropdownName="products"
            useForm={false}
            value={value.product_uuid ?? null}
            onChange={(v) => onChange({ product_uuid: v ?? undefined })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <EntityAutocomplete
            name="currency_code"
            label={t("productPrice.currency")}
            dropdownName="currency_master"
            useForm={false}
            value={value.currency_code ?? null}
            onChange={(v) => onChange({ currency_code: v ?? undefined })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            select
            label={t("common.status")}
            fullWidth
            value={value.is_active ?? ""}
            onChange={(e) => onChange({ is_active: e.target.value || undefined })}
          >
            <MenuItem value="">{t("common.all")}</MenuItem>
            <MenuItem value="true">{t("common.active")}</MenuItem>
            <MenuItem value="false">{t("common.inactive")}</MenuItem>
          </TextField>
        </Grid>

        <Grid size={12} display="flex" justifyContent="flex-end" gap={1} mt={1}>
          <Button color="inherit" onClick={onReset}>
            {t("common.reset")}
          </Button>
          <Button variant="contained" onClick={onApply}>
            {t("common.applyFilters")}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
