// src/features/enquiry/components/EnquiryFilters.tsx

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

export interface EnquiryFilterValues {
  search?: string;
  conversion_status?: string;
  from_date?: string;
  to_date?: string;
  lead_source?: string;
  enquiry_priority?: string;
}

interface EnquiryFiltersProps {
  value: EnquiryFilterValues;
  onChange: (v: Partial<EnquiryFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

/* ================= COMPONENT ================= */

export default function EnquiryFilters({
  value,
  onChange,
  onApply,
  onReset,
}: EnquiryFiltersProps) {
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
      {/* Header */}
      <Stack spacing={1.5} mb={2}>
        <Typography variant="h6" color="primary">
          {t("common.filters")}
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        {/* Date Range */}
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label={t("common.fromDate")}
            type="date"
            fullWidth
            value={value.from_date ?? ""}
            slotProps={{ inputLabel: { shrink: true } }}
            onChange={(e) => onChange({ from_date: e.target.value })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            label={t("common.toDate")}
            type="date"
            fullWidth
            value={value.to_date ?? ""}
            slotProps={{ inputLabel: { shrink: true } }}
            onChange={(e) => onChange({ to_date: e.target.value })}
          />
        </Grid>

        {/* Conversion Status */}
        <Grid size={{ xs: 12, md: 3 }}>
          <DropdownAutocomplete
            name="conversion_status"
            label={t("enquiry.conversionStatus")}
            value={value.conversion_status ?? null}
            onChange={(val: string | null) =>
              onChange({ conversion_status: val || undefined })
            }
            useForm={false}
            allowAdd={false}
            pagination={false}
          />
        </Grid>

        {/* Lead Source */}
        <Grid size={{ xs: 12, md: 3 }}>
          <DropdownAutocomplete
            name="lead_source"
            label={t("common.source")}
            value={value.lead_source ?? null}
            onChange={(val: string | null) =>
              onChange({ lead_source: val || undefined })
            }
            useForm={false}
            allowAdd={false}
            pagination={false}
          />
        </Grid>

         {/* enquiry_priority */}
        <Grid size={{ xs: 12, md: 3 }}>
          <DropdownAutocomplete
            name="enquiry_priority"
            label={t("common.priority")}
            value={value.enquiry_priority ?? null}
            onChange={(val: string | null) =>
              onChange({ enquiry_priority: val || undefined })
            }
            useForm={false}
            allowAdd={false}
            pagination={false}
          />
        </Grid>

        {/* Actions */}
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
