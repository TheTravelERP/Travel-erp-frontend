// src/features/tasks/pages/TaskCreatePage.tsx
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import TaskForm from "../components/TaskForm";
import type { TaskFormInput } from "../task.types";
import { createTask } from "../task.api";
import { usePermission } from "../../../hooks/usePermission";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../utils/errorMessage";
import FormPageLayout from "../../../components/forms/FormPageLayout";

export default function TaskCreatePage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const perms = usePermission("tasks.my");

  const linkedEntityType = searchParams.get("linked_entity_type") || undefined;
  const linkedEntityUuid = searchParams.get("linked_entity_uuid") || undefined;
  const lockedLinkedEntity =
    linkedEntityType && linkedEntityUuid
      ? { linked_entity_type: linkedEntityType, linked_entity_uuid: linkedEntityUuid }
      : undefined;
  const backTo = "/app/tasks/my";

  if (!perms.can_create) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function handleCreate(data: TaskFormInput) {
    try {
      await createTask(data);
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      navigate(backTo);
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.createFailed")), severity: "error" });
    }
  }

  return (
    <FormPageLayout
      title={t("common.create")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.tasks.my"), href: "/app/tasks/my" },
        { label: t("common.create") },
      ]}
    >
      <TaskForm onSubmit={handleCreate} lockedLinkedEntity={lockedLinkedEntity} backTo={backTo} />
    </FormPageLayout>
  );
}
