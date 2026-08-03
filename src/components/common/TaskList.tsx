// src/components/common/TaskList.tsx
//
// Generic drop-in task widget, parameterized by (linkedEntityType,
// linkedEntityUuid) — same pattern as AttachmentList/NoteList. Reads/writes
// through the shared Task Management module (app/models/task_model.py),
// gated by the tasks.my permission rather than the host entity's own menu,
// since Tasks are their own module with their own permission scope.
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InboxIcon from "@mui/icons-material/Inbox";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { getTasks, createTask } from "../../features/tasks/task.api";
import type { TaskListItem } from "../../features/tasks/task.types";
import DropdownColorChip from "./DropdownColorChip";
import EntityAutocomplete from "./EntityAutocomplete";
import { usePermission } from "../../hooks/usePermission";
import { useSnackbar } from "../ui/SnackbarProvider";
import { getErrorMessage } from "../../utils/errorMessage";
import { useLocalizationProfile } from "../../hooks/useLocalizationProfile";
import { createFormatters } from "../../utils/formatters/localization";

interface Props {
  linkedEntityType: string;
  linkedEntityUuid: string;
}

export default function TaskList({ linkedEntityType, linkedEntityUuid }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const perms = usePermission("tasks.my");
  const localizationProfile = useLocalizationProfile();
  const { formatDate } = createFormatters(localizationProfile);

  const [rows, setRows] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedToUuid, setAssignedToUuid] = useState<string | null>(null);

  const fetchData = async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      // ORG scope (tasks.team), not OWN (tasks.my) — this widget shows every
      // task linked to this record regardless of who it's assigned to, not
      // just tasks assigned to the current viewer.
      const res = await getTasks(
        { menu_key: "tasks.team", linked_entity_type: linkedEntityType, linked_entity_uuid: linkedEntityUuid, page_size: 50 },
        signal,
      );
      setRows(res.data);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkedEntityType, linkedEntityUuid]);

  async function handleCreate() {
    if (!title.trim() || !assignedToUuid) return;
    setCreating(true);
    try {
      await createTask({
        title,
        due_date: dueDate || undefined,
        status: "Pending",
        priority: "Medium",
        assigned_to_uuid: assignedToUuid,
        linked_entity_type: linkedEntityType,
        linked_entity_uuid: linkedEntityUuid,
      });
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      setCreateOpen(false);
      setTitle("");
      setDueDate("");
      setAssignedToUuid(null);
      fetchData();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.createFailed")), severity: "error" });
    } finally {
      setCreating(false);
    }
  }

  return (
    <Box>
      {perms.can_create && (
        <Button variant="outlined" size="small" startIcon={<AddIcon />} sx={{ mb: 1.5 }} onClick={() => setCreateOpen(true)}>
          {t("tasks.addTask")}
        </Button>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={20} />
        </Box>
      ) : rows.length === 0 ? (
        <Box textAlign="center" py={3}>
          <InboxIcon sx={{ fontSize: 36, opacity: 0.4 }} />
          <Typography variant="body2" color="text.secondary">{t("common.noRecordsFound")}</Typography>
        </Box>
      ) : (
        <Stack spacing={1} divider={<Box sx={{ borderBottom: "1px solid", borderColor: "divider" }} />}>
          {rows.map((task) => (
            <Box key={task.uuid} sx={{ cursor: "pointer", py: 0.5 }} onClick={() => navigate(`/app/tasks/${task.uuid}`)}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                <Typography variant="body2" fontWeight={600}>{task.title}</Typography>
                <DropdownColorChip dropdownName="task_status" value={task.status} />
              </Stack>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {task.assigned_to_name || "-"}
                </Typography>
                {task.due_date && (
                  <Typography variant="caption" color="text.secondary">
                    {t("tasks.due")}: {formatDate(task.due_date)}
                  </Typography>
                )}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t("tasks.addTask")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth label={t("tasks.title")} value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              fullWidth type="date" label={t("tasks.dueDate")} value={dueDate}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <EntityAutocomplete
              name="assigned_to_uuid"
              label={t("tasks.assignedTo")}
              dropdownName="users"
              useForm={false}
              value={assignedToUuid}
              onChange={(val) => setAssignedToUuid(val)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>{t("common.cancel")}</Button>
          <Button variant="contained" disabled={creating || !title.trim() || !assignedToUuid} onClick={handleCreate}>
            {t("tasks.addTask")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
