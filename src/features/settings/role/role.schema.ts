// src/features/settings/role/role.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getRoleSchema = (t: TFunction) =>
  z.object({
    role_code: z.string().trim().min(1, t('validation.codeRequired')).max(30),
    role_name: z.string().trim().min(1, t('validation.nameRequired')).max(150),
    description: z.string().trim().optional(),
    is_active: z.boolean().optional(),
  });

export type RoleSchema = ReturnType<typeof getRoleSchema>;
