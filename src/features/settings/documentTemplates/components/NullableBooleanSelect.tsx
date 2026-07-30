// src/features/settings/documentTemplates/components/NullableBooleanSelect.tsx
import { MenuItem, TextField } from "@mui/material";
import { Controller, type Control } from "react-hook-form";
import { useTranslation } from "react-i18next";

interface Props {
  name: string;
  label: string;
  control: Control<any>;
}

/** A tri-state control (Inherit / Yes / No) for DocumentTemplateConfig's
 * nullable override fields — null means "inherit the org-level default". */
export default function NullableBooleanSelect({ name, label, control }: Props) {
  const { t } = useTranslation();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          select
          fullWidth
          label={label}
          value={field.value === null || field.value === undefined ? "" : String(field.value)}
          onChange={(e) => {
            const v = e.target.value;
            field.onChange(v === "" ? null : v === "true");
          }}
        >
          <MenuItem value="">{t('documentTemplateConfig.inheritDefault')}</MenuItem>
          <MenuItem value="true">{t('common.yes')}</MenuItem>
          <MenuItem value="false">{t('common.no')}</MenuItem>
        </TextField>
      )}
    />
  );
}
