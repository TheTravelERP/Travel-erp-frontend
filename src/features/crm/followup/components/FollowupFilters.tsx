// src/features/crm/followup/components/FollowupFilters.tsx

import { Box, Button, Grid, Typography, Stack, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import QuickDateRangeFilter from "../../../../components/common/QuickDateRangeFilter";

export interface FollowupFilterValues {
  search?: string;
  enquiry_uuid?: string;
  quotation_uuid?: string;
  assigned_user_uuid?: string;
  followup_type?: string;
  status?: string;
  priority?: string;
  from_date?: string;
  to_date?: string;
  next_from_date?: string;
  next_to_date?: string;
  overdue?: boolean;
}

interface FollowupFiltersProps {
  value: FollowupFilterValues;
  onChange: (v: Partial<FollowupFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
}

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfWeekMonday(d: Date): Date {
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diffToMonday);
}

export default function FollowupFilters({ value, onChange, onApply, onReset }: FollowupFiltersProps) {
  const { t } = useTranslation();

  const applyQuickRange = (from: Date, to: Date) => {
    // These chips are about next_followup_datetime — a field that's
    // routinely on entries logged well in the past. The Follow-up Date
    // range (from_date/to_date) filters a different field entirely
    // (followup_datetime) and, left in place, silently ANDs against these
    // chips and hides the very records they're meant to surface. Clear it
    // whenever a quick chip is used.
    onChange({
      from_date: undefined,
      to_date: undefined,
      next_from_date: toISODate(from),
      next_to_date: toISODate(to),
      overdue: undefined,
    });
  };

  // Which chip (if any) matches the currently applied filter values —
  // drives the "selected" visual state below. Compared by value, not by a
  // separately-tracked "last clicked" flag, so the active chip stays
  // correct even after a page reload/deep link that lands directly on one
  // of these date ranges.
  const todayStr = toISODate(new Date());
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = toISODate(tomorrowDate);
  const weekStart = startOfWeekMonday(new Date());
  const weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
  const weekStartStr = toISODate(weekStart);
  const weekEndStr = toISODate(weekEnd);

  const activeQuickFilter = value.overdue
    ? "overdue"
    : value.next_from_date === todayStr && value.next_to_date === todayStr
    ? "today"
    : value.next_from_date === tomorrowStr && value.next_to_date === tomorrowStr
    ? "tomorrow"
    : value.next_from_date === weekStartStr && value.next_to_date === weekEndStr
    ? "this_week"
    : null;

  const quickFilters = [
    {
      key: "today",
      label: t("followup.filterToday"),
      onClick: () => {
        const today = new Date();
        applyQuickRange(today, today);
      },
    },
    {
      key: "tomorrow",
      label: t("followup.filterTomorrow"),
      onClick: () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        applyQuickRange(tomorrow, tomorrow);
      },
    },
    {
      key: "this_week",
      label: t("common.thisWeek"),
      onClick: () => {
        const start = startOfWeekMonday(new Date());
        const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
        applyQuickRange(start, end);
      },
    },
    {
      key: "overdue",
      label: t("followup.filterOverdue"),
      onClick: () =>
        onChange({
          from_date: undefined,
          to_date: undefined,
          next_from_date: undefined,
          next_to_date: undefined,
          overdue: true,
        }),
    },
  ];

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

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {quickFilters.map((qf) => {
            const active = qf.key === activeQuickFilter;
            return (
              <Chip
                key={qf.key}
                label={qf.label}
                onClick={qf.onClick}
                color={active ? (qf.key === "overdue" ? "error" : "primary") : "default"}
                variant={active ? "filled" : "outlined"}
                size="small"
              />
            );
          })}
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <EntityAutocomplete
            name="enquiry_uuid"
            label={t("followup.enquiry")}
            dropdownName="enquiries"
            useForm={false}
            value={value.enquiry_uuid ?? null}
            onChange={(val) => onChange({ enquiry_uuid: val || undefined })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <EntityAutocomplete
            name="assigned_user_uuid"
            label={t("followup.assignedUser")}
            dropdownName="users"
            useForm={false}
            value={value.assigned_user_uuid ?? null}
            onChange={(val) => onChange({ assigned_user_uuid: val || undefined })}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <DropdownAutocomplete
            name="followup_type"
            dropdownName="followup_type"
            label={t("followup.type")}
            value={value.followup_type ?? null}
            onChange={(val: string | null) => onChange({ followup_type: val || undefined })}
            useForm={false}
            allowAdd={false}
            pagination={false}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <DropdownAutocomplete
            name="status"
            dropdownName="followup_status"
            label={t("followup.status")}
            value={value.status ?? null}
            onChange={(val: string | null) => onChange({ status: val || undefined })}
            useForm={false}
            allowAdd={false}
            pagination={false}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <DropdownAutocomplete
            name="priority"
            dropdownName="followup_priority"
            label={t("followup.priority")}
            value={value.priority ?? null}
            onChange={(val: string | null) => onChange({ priority: val || undefined })}
            useForm={false}
            allowAdd={false}
            pagination={false}
          />
        </Grid>

        <QuickDateRangeFilter
          fromDate={value.from_date}
          toDate={value.to_date}
          onChange={(v) => onChange(v)}
          fromLabel={t("followup.followupDateFrom")}
          toLabel={t("followup.followupDateTo")}
          gridSize={{ xs: 12, md: 2 }}
        />

        <QuickDateRangeFilter
          fromDate={value.next_from_date}
          toDate={value.next_to_date}
          onChange={(v) => onChange({ next_from_date: v.from_date, next_to_date: v.to_date, overdue: undefined })}
          fromLabel={t("followup.nextFollowupFrom")}
          toLabel={t("followup.nextFollowupTo")}
          gridSize={{ xs: 12, md: 2 }}
        />

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
