// src/features/inventory/vendor/components/VendorFilters.tsx

import {
  Box,
  Button,
  Grid,
  Typography,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import QuickDateRangeFilter from "../../../../components/common/QuickDateRangeFilter";

/* ================= TYPES ================= */

export interface VendorFilterValues {
  search?: string;
  vendor_type?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
}

interface VendorFiltersProps {
  value: VendorFilterValues;
  onChange: (v: Partial<VendorFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

/* ================= COMPONENT ================= */

export default function VendorFilters({
  value,
  onChange,
  onApply,
  onReset,
}: VendorFiltersProps) {
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
            name="vendor_type"
            label={t("vendor.type")}
            value={value.vendor_type ?? null}
            onChange={(val: string | null) => onChange({ vendor_type: val || undefined })}
            useForm={false}
            allowAdd={false}
            pagination={false}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <DropdownAutocomplete
            name="status"
            dropdownName="vendor_status"
            label={t("vendor.status")}
            value={value.status ?? null}
            onChange={(val: string | null) => onChange({ status: val || undefined })}
            useForm={false}
            allowAdd={false}
            pagination={false}
          />
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
