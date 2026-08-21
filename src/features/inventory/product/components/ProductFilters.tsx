// src/features/inventory/product/components/ProductFilters.tsx

import { Box, Button, Grid, MenuItem, TextField, Typography, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import QuickDateRangeFilter from "../../../../components/common/QuickDateRangeFilter";

export interface ProductFilterValues {
  search?: string;
  location_uuid?: string;
  service_type_uuid?: string;
  vendor_uuid?: string;
  is_active?: string;
  from_date?: string;
  to_date?: string;
}

interface ProductFiltersProps {
  value: ProductFilterValues;
  onChange: (v: Partial<ProductFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function ProductFilters({
  value,
  onChange,
  onApply,
  onReset,
}: ProductFiltersProps) {
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

        <Grid size={{ xs: 12, md: 3 }}>
          <EntityAutocomplete
            name="location_uuid"
            label={t("product.location")}
            dropdownName="location"
            useForm={false}
            value={value.location_uuid ?? null}
            onChange={(v) => onChange({ location_uuid: v ?? undefined })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <EntityAutocomplete
            name="service_type_uuid"
            label={t("product.serviceType")}
            dropdownName="service_type_master"
            useForm={false}
            value={value.service_type_uuid ?? null}
            onChange={(v) => onChange({ service_type_uuid: v ?? undefined })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <EntityAutocomplete
            name="vendor_uuid"
            label={t("product.vendor")}
            dropdownName="vendors"
            useForm={false}
            value={value.vendor_uuid ?? null}
            onChange={(v) => onChange({ vendor_uuid: v ?? undefined })}
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
