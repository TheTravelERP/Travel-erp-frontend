// src/features/tasks/pages/TaskViewPage.tsx
import { useEffect, useState } from "react";
import { Box, Button, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getTaskByUuid } from "../task.api";
import type { TaskDetail } from "../task.types";
import { usePermission } from "../../../hooks/usePermission";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import FormPageLayout from "../../../components/forms/FormPageLayout";
import DropdownColorChip from "../../../components/common/DropdownColorChip";
import { useLocalizationProfile } from "../../../hooks/useLocalizationProfile";
import { createFormatters } from "../../../utils/formatters/localization";

const LINKED_ENTITY_ROUTES: Record<string, string> = {
  enquiry: "/app/enquiries",
  quotation: "/app/crm/quotations",
  customer: "/app/crm/customers",
  booking: "/app/bookings/list",
  enquiry_followup: "/app/crm/followups",
};

export default function TaskViewPage() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("tasks.my");
  const localizationProfile = useLocalizationProfile();
  const { formatDate } = createFormatters(localizationProfile);

  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<TaskDetail | null>(null);

  useEffect(() => {
    if (uuid) loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadTask() {
    try {
      const data = await getTaskByUuid(uuid!);
      setTask(data);
    } catch (err: any) {
      showSnackbar({ message: err?.response?.data?.detail || t("common.loadUnable"), severity: "error" });
      navigate("/app/tasks/my");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!task) {
    return null;
  }

  const linkedRoute = task.linked_entity_type ? LINKED_ENTITY_ROUTES[task.linked_entity_type] : undefined;

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.tasks.my"), href: "/app/tasks/my" },
        { label: t("common.view") },
      ]}
    >
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
          {task.title}
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("common.status")}</Typography>
            <Typography mt={0.5} component="div">
              <DropdownColorChip dropdownName="task_status" value={task.status} />
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("common.priority")}</Typography>
            <Typography mt={0.5} component="div">
              <DropdownColorChip dropdownName="task_priority" value={task.priority} />
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("tasks.dueDate")}</Typography>
            <Typography mt={0.5}>{task.due_date ? formatDate(task.due_date) : "-"}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="caption">{t("tasks.assignedTo")}</Typography>
            <Typography mt={0.5}>{task.assigned_to_name || "-"}</Typography>
          </Grid>

          {task.linked_entity_label && (
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="caption">{t("tasks.linkedTo")}</Typography>
              <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                {linkedRoute && task.linked_entity_uuid ? (
                  <Chip
                    size="small" clickable
                    label={task.linked_entity_label}
                    onClick={() => navigate(`${linkedRoute}/${task.linked_entity_uuid}`)}
                  />
                ) : (
                  <Typography>{task.linked_entity_label}</Typography>
                )}
              </Stack>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Typography variant="caption">{t("tasks.description")}</Typography>
            <Typography mt={0.5} whiteSpace="pre-wrap">{task.description || "-"}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 3 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Button variant="outlined" onClick={() => navigate("/app/tasks/my")} size="large">
          {t("common.back")}
        </Button>

        {perms.can_edit && (
          <Button variant="contained" size="large" onClick={() => navigate(`/app/tasks/${uuid}/edit`)}>
            {t("common.edit")}
          </Button>
        )}
      </Box>
    </FormPageLayout>
  );
}
