// src/features/crm/followup/followup.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getFollowupSchema = (t: TFunction) =>
  z
    .object({
      enquiry_uuid: z.string().trim().min(1, t('followup.validation.enquiryRequired')),
      assigned_user_uuid: z.string().trim().min(1, t('followup.validation.assignedUserRequired')),
      followup_type: z.string().trim().min(1, t('followup.validation.typeRequired')),
      followup_datetime: z.string().trim().min(1, t('followup.validation.followupDatetimeRequired')),
      next_followup_datetime: z.string().trim().optional(),
      discussion_notes: z.string().trim().min(1, t('followup.validation.discussionRequired')),
      outcome: z.string().trim().optional(),
      status: z.string().trim().optional(),
      priority: z.string().trim().min(1, t('followup.validation.priorityRequired')),
    })
    .refine(
      (data) =>
        !data.next_followup_datetime ||
        !data.followup_datetime ||
        data.next_followup_datetime >= data.followup_datetime,
      {
        message: t('followup.validation.nextBeforeCurrent'),
        path: ['next_followup_datetime'],
      },
    );

export type FollowupSchema = ReturnType<typeof getFollowupSchema>;
