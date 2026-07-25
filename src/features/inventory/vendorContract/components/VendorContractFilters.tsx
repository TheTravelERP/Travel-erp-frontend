// src/features/inventory/vendorContract/components/VendorContractFilters.tsx

import { Box, Button, Grid, Typography, Stack, MenuItem, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import QuickDateRangeFilter from "../../../../components/common/QuickDateRangeFilter";

export interface VendorContractFilterValues {
  search?: string;
  contract_type?: string;
  status?: string;
  from_date?: string;
  to_date?: string;
}

interface VendorContractFiltersProps {
  value: VendorContractFilterValues;
  onChange: (v: Partial<VendorContractFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function VendorContractFilters({
  value,
  onChange,
  onApply,
  onReset,
}: VendorContractFiltersProps) {
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
            name="contract_type"
            dropdownName="vendor_type"
            label={t("vendorContract.type")}
            value={value.contract_type ?? null}
            onChange={(val: string | null) => onChange({ contract_type: val || undefined })}
            useForm={false}
            allowAdd={false}
            pagination={false}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            label={t("vendorContract.status")}
            fullWidth
            value={value.status ?? ""}
            onChange={(e) => onChange({ status: e.target.value || undefined })}
          >
            <MenuItem value="">{t("common.all")}</MenuItem>
            <MenuItem value="Active">{t("common.active")}</MenuItem>
            <MenuItem value="Inactive">{t("common.inactive")}</MenuItem>
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
