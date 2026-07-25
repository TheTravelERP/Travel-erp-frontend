// src/features/package/packagePricing/components/PackagePricingFilters.tsx

import { Box, Button, Grid, MenuItem, TextField, Typography, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import QuickDateRangeFilter from "../../../../components/common/QuickDateRangeFilter";

/* ================= TYPES ================= */

export interface PackagePricingFilterValues {
  search?: string;
  package_uuid?: string;
  price_category?: string;
  from_date?: string;
  to_date?: string;
  is_active?: string;
}

interface PackagePricingFiltersProps {
  value: PackagePricingFilterValues;
  onChange: (v: Partial<PackagePricingFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

/* ================= COMPONENT ================= */

export default function PackagePricingFilters({
  value,
  onChange,
  onApply,
  onReset,
}: PackagePricingFiltersProps) {
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
            name="package_uuid"
            dropdownName="packages"
            label={t("packagePricing.package")}
            useForm={false}
            value={value.package_uuid ?? null}
            onChange={(val) => onChange({ package_uuid: val || undefined })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <DropdownAutocomplete
            name="price_category"
            dropdownName="price_category"
            label={t("packagePricing.priceCategory")}
            value={value.price_category ?? null}
            onChange={(val: string | null) => onChange({ price_category: val || undefined })}
            useForm={false}
            allowAdd={false}
            pagination={false}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            fullWidth
            label={t("common.status")}
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
