// src/features/tasks/components/TaskForm.tsx

import { Box, Grid, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getTaskSchema } from "../task.schema";
import type { TaskFormInput } from "../task.types";
import EntityAutocomplete from "../../../components/common/EntityAutocomplete";
import DropdownAutocomplete from "../../../components/common/DropdownAutocomplete";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../utils/mergeFormDefaults";
import FormSection from "../../../components/forms/FormSection";
import FormActions from "../../../components/forms/FormActions";

interface TaskFormProps {
  defaultValues?: Partial<TaskFormInput>;
  onSubmit: (data: TaskFormInput) => Promise<void>;
  loading?: boolean;
  /** When set (opened from a linked record's own context), the link is
   * carried through but not shown as an editable field. */
  lockedLinkedEntity?: { linked_entity_type: string; linked_entity_uuid: string };
  backTo?: string;
}

const emptyValues: TaskFormInput = {
  title: "",
  description: "",
  due_date: "",
  status: "Pending",
  priority: "Medium",
  assigned_to_uuid: "",
  linked_entity_type: null,
  linked_entity_uuid: null,
};

export default function TaskForm({
  defaultValues,
  onSubmit,
  loading = false,
  lockedLinkedEntity,
  backTo = "/app/tasks/my",
}: TaskFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const taskSchema = useMemo(() => getTaskSchema(t), [t]);

  const withLocked = (values?: Partial<TaskFormInput>) =>
    lockedLinkedEntity ? { ...values, ...lockedLinkedEntity } : values;

  const mergedDefaults = mergeFormDefaults(emptyValues, withLocked(defaultValues));

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TaskFormInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: mergedDefaults,
  });

  useEffect(() => {
    reset(mergeFormDefaults(emptyValues, withLocked(defaultValues)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues, lockedLinkedEntity, reset]);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit, () =>
        showSnackbar({ message: t("validation.fixHighlightedFields"), severity: "error" }),
      )}
      noValidate
    >
      <Grid container spacing={2}>
        <FormSection title={t("tasks.title")}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="title"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("tasks.title")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("tasks.description")}
                  fullWidth
                  multiline
                  rows={3}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="assigned_to_uuid"
              label={t("tasks.assignedTo")}
              control={control}
              dropdownName="users"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="due_date"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="date"
                  label={t("tasks.dueDate")}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <DropdownAutocomplete
              name="priority"
              dropdownName="task_priority"
              label={t("common.priority")}
              control={control}
              useForm
              allowAdd={false}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <DropdownAutocomplete
              name="status"
              dropdownName="task_status"
              label={t("common.status")}
              control={control}
              useForm
              allowAdd={false}
            />
          </Grid>
        </FormSection>

        <FormActions
          onBack={() => navigate(backTo)}
          onDiscard={() => reset()}
          submitting={isSubmitting || loading}
        />
      </Grid>
    </Box>
  );
}
