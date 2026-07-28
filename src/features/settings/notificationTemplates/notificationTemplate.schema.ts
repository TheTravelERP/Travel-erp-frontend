// src/features/settings/notificationTemplates/notificationTemplate.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getNotificationTemplateSchema = (t: TFunction) =>
  z
    .object({
      template_name: z.string().trim().min(1, t('validation.nameRequired')).max(150),
      template_code: z.string().trim().min(1, t('validation.codeRequired')).max(50),
      module: z.string().trim().optional(),
      channel: z.enum(['EMAIL', 'WHATSAPP', 'SMS']),
      subject: z.string().trim().optional(),
      message_body: z.string().trim().min(1, t('validation.fieldRequired')),
      description: z.string().trim().optional(),
      is_active: z.boolean().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.channel === 'EMAIL' && !data.subject) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['subject'], message: t('validation.fieldRequired') });
      }
    });

export type NotificationTemplateSchema = ReturnType<typeof getNotificationTemplateSchema>;
