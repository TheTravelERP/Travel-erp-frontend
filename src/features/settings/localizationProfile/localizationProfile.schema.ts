// src/features/settings/localizationProfile/localizationProfile.schema.ts
import * as z from 'zod';
import type { TFunction } from 'i18next';

export const getLocalizationProfileSchema = (t: TFunction) =>
  z.object({
    profile_name: z.string().trim().min(1, t('validation.nameRequired')).max(150),
    country_code: z.string().trim().min(2, t('validation.codeRequired')).max(2),
    default_currency_code: z.string().trim().min(3, t('validation.codeRequired')).max(3),
    timezone: z.string().trim().min(1, t('localizationProfile.validation.timezoneRequired')),
    financial_year_start_month: z.coerce.number().int().min(1).max(12),
    date_format: z.string().trim().min(1),
    time_format: z.string().trim().min(1),
    number_format: z.string().trim().min(1),
    registration_label: z.string().trim().min(1, t('localizationProfile.validation.registrationLabelRequired')).max(50),
    tax_calculation_method: z.enum(['inclusive', 'exclusive']),
    round_off_method: z.enum(['nearest', 'up', 'down', 'none']),
    default_decimal_places: z.coerce.number().int().min(0).max(6),
    is_active: z.boolean().optional(),
    // Layer 3 elections — genuinely optional (Task 2: never required).
    supply_model: z.string().trim().optional().nullable(),
    rent_a_cab_rate_election: z.string().trim().optional().nullable(),
    forex_valuation_method: z.string().trim().optional().nullable(),
    insurance_commercial_role: z.string().trim().optional().nullable(),
    tax_components: z
      .array(
        z.object({
          uuid: z.string().optional(),
          tax_name: z.string().trim().min(1, t('localizationProfile.validation.taxNameRequired')).max(50),
          tax_percent: z.coerce.number().min(0, t('localizationProfile.validation.taxPercentPositive')),
          tax_type: z.string().trim().optional(),
          sequence: z.coerce.number().int().optional(),
          is_active: z.boolean().optional(),
        }),
      )
      .refine(
        (components) => {
          const names = components.map((c) => c.tax_name.trim().toLowerCase());
          return new Set(names).size === names.length;
        },
        { message: t('localizationProfile.validation.duplicateTaxComponentName') },
      ),
  });

export type LocalizationProfileSchema = ReturnType<typeof getLocalizationProfileSchema>;
