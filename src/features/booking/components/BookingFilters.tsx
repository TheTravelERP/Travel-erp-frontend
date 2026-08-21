// src/features/booking/components/BookingFilters.tsx

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
import { BOOKING_STATUSES } from "../booking.types";
import EntityAutocomplete from "../../../components/common/EntityAutocomplete";
import DropdownAutocomplete from "../../../components/common/DropdownAutocomplete";

export interface BookingFilterValues {
  status?: string;
  business_type?: string;
  enquiry_uuid?: string;
  cust_uuid?: string;
  travel_from_date?: string;
  travel_to_date?: string;
  is_active?: string;
}

interface BookingFiltersProps {
  value: BookingFilterValues;
  onChange: (v: Partial<BookingFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function BookingFilters({ value, onChange, onApply, onReset }: BookingFiltersProps) {
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
            label={t("booking.status")}
            value={value.status ?? ""}
            onChange={(e) => onChange({ status: e.target.value || undefined })}
          >
            <MenuItem value="">{t("common.all")}</MenuItem>
            {BOOKING_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <DropdownAutocomplete
            name="business_type"
            label={t("booking.businessType")}
            value={value.business_type ?? null}
            onChange={(val: string | null) => onChange({ business_type: val || undefined })}
            useForm={false}
            allowAdd={false}
            pagination={false}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <EntityAutocomplete
            name="enquiry_uuid"
            label={t("booking.enquiry")}
            dropdownName="enquiries"
            useForm={false}
            value={value.enquiry_uuid ?? null}
            onChange={(val) => onChange({ enquiry_uuid: val || undefined })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <EntityAutocomplete
            name="cust_uuid"
            label={t("common.customer")}
            dropdownName="customers"
            useForm={false}
            value={value.cust_uuid ?? null}
            onChange={(val) => onChange({ cust_uuid: val || undefined })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            type="date"
            fullWidth
            label={t("booking.travelStartDate")}
            value={value.travel_from_date ?? ""}
            onChange={(e) => onChange({ travel_from_date: e.target.value || undefined })}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            type="date"
            fullWidth
            label={t("booking.travelEndDate")}
            value={value.travel_to_date ?? ""}
            onChange={(e) => onChange({ travel_to_date: e.target.value || undefined })}
            slotProps={{ inputLabel: { shrink: true } }}
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
