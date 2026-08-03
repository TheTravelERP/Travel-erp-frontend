// src/features/departure/components/DepartureFilters.tsx

import { Box, Button, Grid, Typography, Stack, MenuItem, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import EntityAutocomplete from "../../../components/common/EntityAutocomplete";
import QuickDateRangeFilter from "../../../components/common/QuickDateRangeFilter";
import { DEPARTURE_STATUSES } from "../departure.types";

export interface DepartureFilterValues {
  search?: string;
  status?: string;
  pkg_uuid?: string;
  from_date?: string;
  to_date?: string;
}

interface DepartureFiltersProps {
  value: DepartureFilterValues;
  onChange: (v: Partial<DepartureFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function DepartureFilters({
  value,
  onChange,
  onApply,
  onReset,
}: DepartureFiltersProps) {
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
            name="pkg_uuid"
            label={t("departure.package")}
            dropdownName="packages"
            value={value.pkg_uuid ?? null}
            onChange={(val: string | null) => onChange({ pkg_uuid: val || undefined })}
            useForm={false}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            select
            label={t("common.status")}
            fullWidth
            value={value.status ?? ""}
            onChange={(e) => onChange({ status: e.target.value || undefined })}
          >
            <MenuItem value="">{t("common.all")}</MenuItem>
            {DEPARTURE_STATUSES.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {t(`departure.statusValues.${opt}`, { defaultValue: opt })}
              </MenuItem>
            ))}
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
