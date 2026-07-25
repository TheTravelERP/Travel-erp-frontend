// src/features/package/components/PackageFilters.tsx

import { Box, Button, Grid, MenuItem, TextField, Typography, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import DropdownAutocomplete from "../../../components/common/DropdownAutocomplete";
import EntityAutocomplete from "../../../components/common/EntityAutocomplete";
import QuickDateRangeFilter from "../../../components/common/QuickDateRangeFilter";

/* ================= TYPES ================= */

export interface PackageFilterValues {
  search?: string;
  status?: string;
  package_type_uuid?: string;
  from_date?: string;
  to_date?: string;
  is_active?: string;
}

interface PackageFiltersProps {
  value: PackageFilterValues;
  onChange: (v: Partial<PackageFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

/* ================= COMPONENT ================= */

export default function PackageFilters({
  value,
  onChange,
  onApply,
  onReset,
}: PackageFiltersProps) {
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
          <DropdownAutocomplete
            name="status"
            dropdownName="package_status"
            label={t("package.packageStatus")}
            value={value.status ?? null}
            onChange={(val: string | null) => onChange({ status: val || undefined })}
            useForm={false}
            allowAdd={false}
            pagination={false}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <EntityAutocomplete
            name="package_type_uuid"
            dropdownName="package_types"
            label={t("package.packageType")}
            useForm={false}
            value={value.package_type_uuid ?? null}
            onChange={(val) => onChange({ package_type_uuid: val || undefined })}
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
