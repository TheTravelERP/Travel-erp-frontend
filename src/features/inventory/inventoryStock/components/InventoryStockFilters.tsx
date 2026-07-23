// src/features/inventory/inventoryStock/components/InventoryStockFilters.tsx

import {
  Autocomplete,
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Typography,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import { useEntityDropdown } from "../../../../hooks/useEntityDropdown";

/* ================= TYPES ================= */

export interface InventoryStockFilterValues {
  search?: string;
  service_type?: string;
  contract_uuid?: string;
  status?: string;
}

interface InventoryStockFiltersProps {
  value: InventoryStockFilterValues;
  onChange: (v: Partial<InventoryStockFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

/* ================= COMPONENT ================= */

export default function InventoryStockFilters({
  value,
  onChange,
  onApply,
  onReset,
}: InventoryStockFiltersProps) {
  const { t } = useTranslation();

  // Standalone (non react-hook-form) entity search — reuses the same data hook
  // EntityAutocomplete uses internally, since that component only supports
  // react-hook-form's Controller and this is a plain filter panel.
  const { options, loading, setSearch } = useEntityDropdown({ dropdownName: "vendor_contracts" });
  const selectedContract = options.find((o) => o.value === value.contract_uuid) || null;

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
        <Grid size={{ xs: 12, md: 4 }}>
          <DropdownAutocomplete
            name="service_type"
            dropdownName="inventory_service_type"
            label={t("inventoryStock.serviceType")}
            value={value.service_type ?? null}
            onChange={(val: string | null) => onChange({ service_type: val || undefined })}
            useForm={false}
            allowAdd={false}
            pagination={false}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Autocomplete
            options={options}
            loading={loading}
            value={selectedContract}
            getOptionLabel={(option: any) => option?.label || ""}
            isOptionEqualToValue={(opt: any, val: any) => opt?.value === val?.value}
            onInputChange={(_, val, reason) => {
              if (reason === "input") setSearch(val);
            }}
            onChange={(_, val: any) => onChange({ contract_uuid: val?.value || undefined })}
            renderInput={(params) => (
              <TextField {...params} label={t("inventoryStock.contract")} fullWidth />
            )}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            fullWidth
            label={t("vendorContract.status")}
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
