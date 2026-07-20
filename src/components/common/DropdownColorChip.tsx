// src/components/common/DropdownColorChip.tsx
import { Chip, type ChipProps } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDropdownOptions } from "../../hooks/useDropdownOptions";

interface DropdownColorChipProps extends Omit<ChipProps, "label" | "color"> {
  dropdownName: string;
  value?: string | null;
  fallbackColor?: string;
}

// Picks readable text color (black/white) for a given hex background.
function getContrastText(hex: string): string {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  const r = parseInt(full.substring(0, 2), 16);
  const g = parseInt(full.substring(2, 4), 16);
  const b = parseInt(full.substring(4, 6), 16);

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#000000" : "#ffffff";
}

export default function DropdownColorChip({
  dropdownName,
  value,
  fallbackColor = "#9e9e9e",
  size = "small",
  sx,
  ...chipProps
}: DropdownColorChipProps) {
  const { options } = useDropdownOptions(dropdownName);
  const { t } = useTranslation();

  if (!value) return null;

  const match = options.find((opt) => opt.value === value);
  const color = match?.color_code || fallbackColor;
  const label: string = t(`dropdown.${dropdownName}.${value}`, {
    defaultValue: match?.label ?? value,
  });

  return (
    <Chip
      {...chipProps}
      size={size}
      label={label}
      sx={{
        bgcolor: color,
        color: getContrastText(color),
        fontWeight: 500,
        ...sx,
      }}
    />
  );
}
