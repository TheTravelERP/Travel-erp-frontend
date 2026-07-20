// src/features/settings/users/users.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';
import { getValidators } from '../../../utils/validator';

const getProfileFieldsShape = () => ({
  dob: z.string().optional().or(z.literal('')),
  gender: z.string().optional().or(z.literal('')),
  marital_status: z.string().optional().or(z.literal('')),
  anniversary_date: z.string().optional().or(z.literal('')),
  blood_group: z.string().optional().or(z.literal('')),
  designation: z.string().optional().or(z.literal('')),
  date_of_joining: z.string().optional().or(z.literal('')),
  picture_url: z.string().optional().or(z.literal('')),
  emergency_contact_name: z.string().optional().or(z.literal('')),
  emergency_contact_number: z.string().optional().or(z.literal('')),
  identification_type: z.string().optional().or(z.literal('')),
  identification_number: z.string().optional().or(z.literal('')),
  identification_file_url: z.string().optional().or(z.literal('')),
});

export const getUserCreateSchema = (t: TFunction) => {
  const v = getValidators(t);
  return z.object({
    name: z.string().trim().min(1, t('validation.nameRequired')),
    email: z.string().trim().email(t('validation.emailInvalid')),
    mobile: z
      .string()
      .trim()
      .regex(/^\+[1-9][0-9]{7,15}$/, t('validation.internationalMobile')),
    user_type: z.enum(['Admin', 'Employee', 'Agent']),
    password: v.password,
    ...getProfileFieldsShape(),
  });
};

export const getUserUpdateSchema = (t: TFunction) =>
  z.object({
    name: z.string().trim().min(1, t('validation.nameRequired')),
    mobile: z
      .string()
      .trim()
      .regex(/^\+[1-9][0-9]{7,15}$/, t('validation.internationalMobile')),
    user_type: z.enum(['Admin', 'Employee', 'Agent']),
    status: z.enum(['Active', 'Inactive', 'Suspended']),
    ...getProfileFieldsShape(),
  });

export type UserCreateFormInput = z.infer<ReturnType<typeof getUserCreateSchema>>;
export type UserUpdateFormInput = z.infer<ReturnType<typeof getUserUpdateSchema>>;
