// src/features/settings/stateProvinceMaster/components/StateProvinceFilters.tsx

import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import QuickDateRangeFilter from "../../../../components/common/QuickDateRangeFilter";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";

/* ================= TYPES ================= */

export interface StateProvinceFilterValues {
  search?: string;
  from_date?: string;
  to_date?: string;
  is_active?: string;
  country_code?: string;
}

interface StateProvinceFiltersProps {
  value: StateProvinceFilterValues;
  onChange: (v: Partial<StateProvinceFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

/* ================= COMPONENT ================= */

export default function StateProvinceFilters({
  value,
  onChange,
  onApply,
  onReset,
}: StateProvinceFiltersProps) {
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
        <Grid size={{ xs: 12, md: 4 }}>
          <EntityAutocomplete
            name="country_code"
            label={t("common.country")}
            dropdownName="country"
            useForm={false}
            value={value.country_code ?? null}
            onChange={(v) => onChange({ country_code: v ?? undefined })}
          />
        </Grid>

        <QuickDateRangeFilter
          fromDate={value.from_date}
          toDate={value.to_date}
          onChange={onChange}
        />

        <Grid size={{ xs: 12, md: 4 }}>
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
