// src/features/inventory/hotel/components/HotelFilters.tsx

import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  Typography,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import QuickDateRangeFilter from "../../../../components/common/QuickDateRangeFilter";

/* ================= TYPES ================= */

export interface HotelFilterValues {
  search?: string;
  city?: string;
  star_rating?: string;
  from_date?: string;
  to_date?: string;
  is_active?: string;
}

interface HotelFiltersProps {
  value: HotelFilterValues;
  onChange: (v: Partial<HotelFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

/* ================= COMPONENT ================= */

export default function HotelFilters({
  value,
  onChange,
  onApply,
  onReset,
}: HotelFiltersProps) {
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
          <TextField
            fullWidth
            label={t("hotel.city")}
            value={value.city ?? ""}
            onChange={(e) => onChange({ city: e.target.value || undefined })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            fullWidth
            type="number"
            label={t("hotel.starRating")}
            value={value.star_rating ?? ""}
            slotProps={{ htmlInput: { min: 1, max: 5 } }}
            onChange={(e) => onChange({ star_rating: e.target.value || undefined })}
          />
        </Grid>

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
