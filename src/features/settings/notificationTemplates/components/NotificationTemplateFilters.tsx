// src/features/settings/notificationTemplates/components/NotificationTemplateFilters.tsx

import { Box, Button, Grid, MenuItem, TextField, Typography, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import QuickDateRangeFilter from "../../../../components/common/QuickDateRangeFilter";
import type { NotificationChannel } from "../notificationTemplate.types";

export interface NotificationTemplateFilterValues {
  search?: string;
  channel?: NotificationChannel | "";
  module?: string;
  from_date?: string;
  to_date?: string;
}

interface Props {
  value: NotificationTemplateFilterValues;
  onChange: (v: Partial<NotificationTemplateFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

export default function NotificationTemplateFilters({ value, onChange, onApply, onReset }: Props) {
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, mb: 3, border: "1px solid", borderColor: "divider" }}>
      <Stack spacing={1.5} mb={2}>
        <Typography variant="h6" color="primary">
          {t("common.filters")}
        </Typography>
      </Stack>

      <Grid container spacing={2}>
        <QuickDateRangeFilter fromDate={value.from_date} toDate={value.to_date} onChange={onChange} />

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            fullWidth
            label={t("notificationTemplate.channel")}
            value={value.channel ?? ""}
            onChange={(e) => onChange({ channel: e.target.value as NotificationChannel })}
          >
            <MenuItem value="">{t("common.all")}</MenuItem>
            <MenuItem value="EMAIL">{t("communicationProvider.categoryEmail")}</MenuItem>
            <MenuItem value="WHATSAPP">{t("communicationProvider.categoryWhatsapp")}</MenuItem>
            <MenuItem value="SMS">{t("communicationProvider.categorySms")}</MenuItem>
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            fullWidth
            label={t("notificationTemplate.module")}
            value={value.module ?? ""}
            onChange={(e) => onChange({ module: e.target.value })}
          >
            <MenuItem value="">{t("common.all")}</MenuItem>
            <MenuItem value="CRM">CRM</MenuItem>
            <MenuItem value="Booking">{t("notificationTemplate.moduleBooking")}</MenuItem>
            <MenuItem value="Finance">{t("notificationTemplate.moduleFinance")}</MenuItem>
            <MenuItem value="System">{t("notificationTemplate.moduleSystem")}</MenuItem>
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
