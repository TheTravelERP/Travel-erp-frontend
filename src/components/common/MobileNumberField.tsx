// src/components/common/MobileNumberField.tsx

import { TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import { MOBILE_NUMBER_REGEX } from "../../utils/validator";

/**
 * E.164-shaped mobile/phone input: '+' followed by 8-15 digits (no leading
 * zero). Sanitizes every keystroke — a leading '+' is kept only as the
 * first character, everything else must be a digit, and input is truncated
 * to 16 characters ('+' + 15 digits) — so it's physically impossible to
 * type past the standard, not just rejected on submit. Mirrors
 * MOBILE_NUMBER_REGEX in ../../utils/validator.ts and
 * app/validators/common_validators.py::validate_mobile on the backend.
 */
const MAX_LENGTH = 16; // '+' + 15 digits

function sanitize(raw: string): string {
  const hasLeadingPlus = raw.startsWith("+");
  const digits = raw.replace(/[^0-9]/g, "");
  const value = (hasLeadingPlus ? "+" : "") + digits;
  return value.slice(0, MAX_LENGTH);
}

interface MobileNumberFieldProps {
  label: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  placeholder?: string;

  // React Hook Form mode (default) — requires `control`/`name`.
  name?: string;
  control?: any;
  useForm?: boolean;

  // Plain controlled mode (useForm={false}).
  value?: string;
  onChange?: (value: string) => void;
}

export default function MobileNumberField({
  label,
  required = false,
  disabled = false,
  fullWidth = true,
  placeholder = "+14155550100",
  name,
  control,
  useForm = true,
  value,
  onChange,
}: MobileNumberFieldProps) {
  if (useForm && control && name) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            value={field.value ?? ""}
            onChange={(e) => field.onChange(sanitize(e.target.value))}
            label={label}
            required={required}
            disabled={disabled}
            fullWidth={fullWidth}
            placeholder={placeholder}
            inputMode="tel"
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
    );
  }

  return (
    <TextField
      value={value ?? ""}
      onChange={(e) => onChange?.(sanitize(e.target.value))}
      label={label}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      placeholder={placeholder}
      inputMode="tel"
    />
  );
}

export { MOBILE_NUMBER_REGEX };
