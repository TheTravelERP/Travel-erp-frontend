// src/components/common/QuickDateRangeFilter.tsx
import { useState } from "react";
import { Grid, TextField, MenuItem } from "@mui/material";
import { useTranslation } from "react-i18next";

import { DATE_RANGE_PRESETS, getPresetByValue, type DateRangePresetValue } from "../../utils/dateRangePresets";
import { useFinancialYearStartMonth } from "../../hooks/useOrganizationSettings";

export interface QuickDateRangeFilterProps {
  fromDate?: string;
  toDate?: string;
  onChange: (v: { from_date?: string; to_date?: string }) => void;
  fromLabel?: string;
  toLabel?: string;
  gridSize?: { xs?: number; md?: number };
}

export default function QuickDateRangeFilter({
  fromDate,
  toDate,
  onChange,
  fromLabel,
  toLabel,
  gridSize = { xs: 12, md: 2 },
}: QuickDateRangeFilterProps) {
  const { t } = useTranslation();
  const fyStartMonth = useFinancialYearStartMonth();

  const [preset, setPreset] = useState<DateRangePresetValue>("custom");

  const rangeError =
    fromDate && toDate && fromDate > toDate ? t("common.dateRangeInvalid") : null;

  const handlePresetChange = (value: DateRangePresetValue) => {
    setPreset(value);
    const def = getPresetByValue(value);
    if (def?.compute) {
      const { from, to } = def.compute(fyStartMonth);
      onChange({ from_date: from, to_date: to });
    }
  };

  const handleFromDateChange = (v: string) => {
    setPreset("custom");
    onChange({ from_date: v });
  };

  const handleToDateChange = (v: string) => {
    setPreset("custom");
    onChange({ to_date: v });
  };

  return (
    <>
      <Grid size={gridSize}>
        <TextField
          select
          fullWidth
          size="small"
          label={t("common.dateRange")}
          value={preset}
          onChange={(e) => handlePresetChange(e.target.value as DateRangePresetValue)}
        >
          {DATE_RANGE_PRESETS.map((p) => (
            <MenuItem key={p.value} value={p.value}>
              {t(p.labelKey)}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid size={gridSize}>
        <TextField
          label={fromLabel ?? t("common.fromDate")}
          type="date"
          fullWidth
          value={fromDate ?? ""}
          slotProps={{ inputLabel: { shrink: true } }}
          error={!!rangeError}
          onChange={(e) => handleFromDateChange(e.target.value)}
        />
      </Grid>

      <Grid size={gridSize}>
        <TextField
          label={toLabel ?? t("common.toDate")}
          type="date"
          fullWidth
          value={toDate ?? ""}
          slotProps={{ inputLabel: { shrink: true } }}
          error={!!rangeError}
          helperText={rangeError ?? undefined}
          onChange={(e) => handleToDateChange(e.target.value)}
        />
      </Grid>
    </>
  );
}
