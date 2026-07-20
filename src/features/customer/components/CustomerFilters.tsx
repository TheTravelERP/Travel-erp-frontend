// src/features/customer/components/CustomerFilters.tsx

import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import DropdownAutocomplete from "../../../components/common/DropdownAutocomplete";

/* ================= TYPES ================= */

export interface CustomerFilterValues {
  search?: string;
  nationality?: string;
  gender?: string;
}

interface CustomerFiltersProps {
  value: CustomerFilterValues;
  onChange: (v: Partial<CustomerFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

/* ================= COMPONENT ================= */

export default function CustomerFilters({
  value,
  onChange,
  onApply,
  onReset,
}: CustomerFiltersProps) {
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
          <TextField
            fullWidth
            label={t("customer.nationality")}
            value={value.nationality ?? ""}
            onChange={(e) => onChange({ nationality: e.target.value || undefined })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <DropdownAutocomplete
            name="gender"
            label={t("settings.gender")}
            value={value.gender ?? null}
            onChange={(val: string | null) => onChange({ gender: val || undefined })}
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
