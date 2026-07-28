// src/features/settings/communicationProviders/communicationProvider.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getCommunicationProviderSchema = (t: TFunction) =>
  z
    .object({
      provider_category: z.enum(['EMAIL', 'WHATSAPP', 'SMS']),
      provider_type: z.string().trim().min(1, t('validation.fieldRequired')),
      provider_name: z.string().trim().min(1, t('validation.nameRequired')).max(150),
      is_default: z.boolean().optional(),
      is_active: z.boolean().optional(),

      from_name: z.string().trim().optional(),
      from_email: z.string().trim().optional(),
      reply_to: z.string().trim().optional(),
      smtp_host: z.string().trim().optional(),
      smtp_port: z.coerce.number().int().optional().or(z.literal('' as unknown as number)),
      smtp_username: z.string().trim().optional(),
      smtp_password: z.string().trim().optional(),
      encryption_type: z.string().trim().optional(),

      phone_number_id: z.string().trim().optional(),
      business_account_id: z.string().trim().optional(),
      access_token: z.string().trim().optional(),
      webhook_verify_token: z.string().trim().optional(),

      api_key: z.string().trim().optional(),
      secret_key: z.string().trim().optional(),
      sender_id: z.string().trim().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.provider_category === 'EMAIL') {
        if (!data.from_email) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['from_email'], message: t('validation.emailRequired') });
        }
        if (!data.smtp_host) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['smtp_host'], message: t('validation.fieldRequired') });
        }
      }
      if (data.provider_category === 'WHATSAPP' && !data.phone_number_id) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['phone_number_id'], message: t('validation.fieldRequired') });
      }
      if (data.provider_category === 'SMS' && !data.sender_id) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sender_id'], message: t('validation.fieldRequired') });
      }
    });

export type CommunicationProviderSchema = ReturnType<typeof getCommunicationProviderSchema>;
