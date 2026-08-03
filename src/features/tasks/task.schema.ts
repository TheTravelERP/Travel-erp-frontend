// src/features/tasks/task.schema.ts
import * as z from "zod";
import type { TFunction } from "i18next";

export const getTaskSchema = (t: TFunction) =>
  z.object({
    title: z.string().trim().min(1, t("validation.nameRequired")),
    description: z.string().trim().optional(),
    due_date: z.string().trim().optional(),
    status: z.string().trim().min(1, t("validation.statusRequired")),
    priority: z.string().trim().min(1, t("validation.priorityRequired")),
    assigned_to_uuid: z.string().trim().min(1, t("followup.validation.assignedUserRequired")),
    linked_entity_type: z.string().trim().optional().nullable(),
    linked_entity_uuid: z.string().trim().optional().nullable(),
  });

export type TaskSchema = ReturnType<typeof getTaskSchema>;
