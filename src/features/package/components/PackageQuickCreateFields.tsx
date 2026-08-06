// src/features/package/components/PackageQuickCreateFields.tsx
//
// Shared "bare Package" quick-create form — schema, code-suggestion helper,
// and the field layout itself. Deliberately narrow: it may only ever
// produce a bare Package row (name/code/type/currency). It must never touch
// PackageService, PackageDetail, inclusions/exclusions, or supplier
// mapping — a package created here has zero PackageService rows by design,
// which is exactly what routes a quotation built against it onto the Flat
// Package Pricing fallback (Occupancy Group UI) instead of the normal
// service-lines table. Do not add a "quick add a service too" convenience
// here; that boundary is intentional.
//
// Used by both ResolvePackageLink.tsx (Enquiry-linked flow, embedded inline
// in a Collapse panel) and CreatePackageDialog.tsx (Direct Quotation flow,
// embedded in a Dialog) — the two callers differ only in what happens
// *after* a package is created (link to Enquiry vs. select directly onto a
// form field), not in how the package itself is captured/validated.

import { Grid, TextField } from "@mui/material";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import * as z from "zod";
import { useTranslation } from "react-i18next";

import EntityAutocomplete from "../../../components/common/EntityAutocomplete";

export const getPackageQuickCreateSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().trim().min(1, t("validation.nameRequired")),
    code: z.string().trim().min(1, t("validation.codeRequired")),
    package_type_uuid: z.string().nullable().optional(),
    currency_code: z.string().trim().length(3, t("quotation.validation.currencyCode3")),
  });

export type PackageQuickCreateValues = z.infer<ReturnType<typeof getPackageQuickCreateSchema>>;

// Purely a client-side convenience suggestion — the backend still owns
// uniqueness (409/400 on a duplicate code), this never needs to be authoritative.
export function suggestPackageCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

interface PackageQuickCreateFieldsProps {
  control: Control<PackageQuickCreateValues>;
  setValue: (name: "code" | "package_type_uuid", value: any, options?: any) => void;
  errors: FieldErrors<PackageQuickCreateValues>;
  onPackageTypeAddNew: () => void;
  codeManuallyEditedRef: { current: boolean };
}

export default function PackageQuickCreateFields({
  control,
  setValue,
  errors,
  onPackageTypeAddNew,
  codeManuallyEditedRef,
}: PackageQuickCreateFieldsProps) {
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
              label={t("quotation.package")}
              size="small"
              fullWidth
              required
              error={!!errors.name}
              helperText={errors.name?.message}
              onChange={(e) => {
                field.onChange(e);
                if (!codeManuallyEditedRef.current) {
                  setValue("code", suggestPackageCode(e.target.value));
                }
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t("common.code")}
              size="small"
              fullWidth
              required
              error={!!errors.code}
              helperText={errors.code?.message}
              onChange={(e) => {
                codeManuallyEditedRef.current = true;
                field.onChange(e);
              }}
            />
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6 }}>
        <EntityAutocomplete
          name="package_type_uuid"
          label={t("package.packageType")}
          control={control}
          dropdownName="package_types"
          allowAdd
          onAddNew={onPackageTypeAddNew}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <Controller
          name="currency_code"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label={t("quotation.currencyCode")}
              size="small"
              fullWidth
              required
              error={!!errors.currency_code}
              helperText={errors.currency_code?.message}
            />
          )}
        />
      </Grid>
    </Grid>
  );
}
