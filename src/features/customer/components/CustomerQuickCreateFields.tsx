// src/features/customer/components/CustomerQuickCreateFields.tsx
//
// Shared "bare Customer" quick-create form — schema + field layout. Used by
// CreateCustomerDialog.tsx (Quotation's Customer resolution panel, both
// Direct and From-Enquiry) as the single reusable popup body — blank vs
// pre-filled is purely a matter of the caller's initial values, never a
// second component.

import { Grid, TextField } from "@mui/material";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import * as z from "zod";
import { useTranslation } from "react-i18next";

import MobileNumberField from "../../../components/common/MobileNumberField";
import { MOBILE_NUMBER_REGEX } from "../../../utils/validator";

export const getCustomerQuickCreateSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().trim().min(1, t("validation.nameRequired")),
    mobile: z
      .string()
      .trim()
      .min(1, t("validation.mobileRequired"))
      .refine((v) => MOBILE_NUMBER_REGEX.test(v), t("validation.internationalMobile")),
    email: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), { message: t("validation.emailInvalid") }),
  });

export type CustomerQuickCreateValues = z.infer<ReturnType<typeof getCustomerQuickCreateSchema>>;

interface CustomerQuickCreateFieldsProps {
  control: Control<CustomerQuickCreateValues>;
  errors: FieldErrors<CustomerQuickCreateValues>;
}

export default function CustomerQuickCreateFields({ control, errors }: CustomerQuickCreateFieldsProps) {
  const { t } = useTranslation();

  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12 }}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t("common.customerName")}
              size="small"
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name?.message}
            />
          )}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <MobileNumberField name="mobile" control={control} label={t("common.mobile")} required />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t("common.email")}
              size="small"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />
      </Grid>
    </Grid>
  );
}
