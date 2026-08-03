// src/features/tasks/components/TaskFilters.tsx

import { Box, Button, Grid, Typography, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import DropdownAutocomplete from "../../../components/common/DropdownAutocomplete";
import EntityAutocomplete from "../../../components/common/EntityAutocomplete";
import QuickDateRangeFilter from "../../../components/common/QuickDateRangeFilter";

export interface TaskFilterValues {
  search?: string;
  status?: string;
  priority?: string;
  assigned_to_uuid?: string;
  from_date?: string;
  to_date?: string;
}

interface TaskFiltersProps {
  value: TaskFilterValues;
  onChange: (v: Partial<TaskFilterValues>) => void;
  onApply: () => void;
  onReset: () => void;
  showAssignedTo?: boolean;
}

export default function TaskFilters({ value, onChange, onApply, onReset, showAssignedTo = false }: TaskFiltersProps) {
  const { t } = useTranslation();

  return (
    <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 2, mb: 3, border: "1px solid", borderColor: "divider" }}>
      <Stack spacing={1.5} mb={2}>
        <Typography variant="h6" color="primary">{t("common.filters")}</Typography>
      </Stack>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <DropdownAutocomplete
            name="status"
            dropdownName="task_status"
            label={t("common.status")}
            value={value.status ?? null}
            onChange={(val: string | null) => onChange({ status: val || undefined })}
            useForm={false}
            allowAdd={false}
            pagination={false}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <DropdownAutocomplete
            name="priority"
            dropdownName="task_priority"
            label={t("common.priority")}
            value={value.priority ?? null}
            onChange={(val: string | null) => onChange({ priority: val || undefined })}
            useForm={false}
            allowAdd={false}
            pagination={false}
          />
        </Grid>

        {showAssignedTo && (
          <Grid size={{ xs: 12, md: 3 }}>
            <EntityAutocomplete
              name="assigned_to_uuid"
              label={t("tasks.assignedTo")}
              dropdownName="users"
              useForm={false}
              value={value.assigned_to_uuid ?? null}
              onChange={(val) => onChange({ assigned_to_uuid: val || undefined })}
            />
          </Grid>
        )}

        <QuickDateRangeFilter
          fromDate={value.from_date}
          toDate={value.to_date}
          onChange={onChange}
          fromLabel={t("tasks.dueDateFrom")}
          toLabel={t("tasks.dueDateTo")}
          gridSize={{ xs: 12, md: showAssignedTo ? 4 : 3 }}
        />

        <Grid size={12} display="flex" justifyContent="flex-end" gap={1} mt={1}>
          <Button color="inherit" onClick={onReset}>{t("common.reset")}</Button>
          <Button variant="contained" onClick={onApply}>{t("common.applyFilters")}</Button>
        </Grid>
      </Grid>
    </Box>
  );
}
