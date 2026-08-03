// src/features/crm/quotation/components/QuotationFilters.tsx

import { Box, Button, Grid, MenuItem, TextField, Typography, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import QuickDateRangeFilter from "../../../../components/common/QuickDateRangeFilter";

const STATUSES = ["Draft", "Sent", "Revised", "Accepted", "Rejected", "Expired", "Converted"];

export interface QuotationFilterValues {
  search?: string;
  status?: string;
  enquiry_uuid?: string;
  from_date?: string;
  to_date?: string;
  is_active?: string;
}

interface QuotationFiltersProps {
  value: QuotationFilterValues;
  onChange: (v: Partial<QuotationFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function QuotationFilters({ value, onChange, onApply, onReset }: QuotationFiltersProps) {
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
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            fullWidth
            label={t("quotation.status")}
            value={value.status ?? ""}
            onChange={(e) => onChange({ status: e.target.value || undefined })}
          >
            <MenuItem value="">{t("common.all")}</MenuItem>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <EntityAutocomplete
            name="enquiry_uuid"
            label={t("quotation.enquiry")}
            dropdownName="enquiries"
            useForm={false}
            value={value.enquiry_uuid ?? null}
            onChange={(val) => onChange({ enquiry_uuid: val || undefined })}
          />
        </Grid>

        <QuickDateRangeFilter
          fromDate={value.from_date}
          toDate={value.to_date}
          onChange={onChange}
          gridSize={{ xs: 12, md: 2 }}
        />

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
