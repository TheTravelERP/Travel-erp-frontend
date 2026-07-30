// src/features/settings/eventAutomation/components/RecipientsEditor.tsx

import { useState } from "react";
import { Box, Button, Chip, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { RecipientItem, RecipientType } from "../eventAutomation.types";

const FIXED_TYPES: RecipientType[] = ["ASSIGNED_USER", "CUSTOMER", "REPORTING_MANAGER", "BOOKING_AGENT"];
const VALUE_TYPES: RecipientType[] = ["SPECIFIC_EMAIL", "SPECIFIC_MOBILE"];

interface Props {
  value: RecipientItem[];
  onChange: (value: RecipientItem[]) => void;
}

export default function RecipientsEditor({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [pendingType, setPendingType] = useState<RecipientType | "">("");
  const [pendingValue, setPendingValue] = useState("");

  const typeLabel = (type: RecipientType) => t(`eventAutomation.recipientType.${type}`);

  function addFixed(type: RecipientType) {
    if (value.some((r) => r.type === type)) return;
    onChange([...value, { type }]);
  }

  function addWithValue() {
    if (!pendingType || !pendingValue.trim()) return;
    onChange([...value, { type: pendingType as RecipientType, value: pendingValue.trim() }]);
    setPendingType("");
    setPendingValue("");
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        {t("eventAutomation.recipients")}
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
        {value.length === 0 && (
          <Typography variant="caption" color="text.secondary">
            {t("eventAutomation.noRecipients")}
          </Typography>
        )}
        {value.map((r, i) => (
          <Chip
            key={`${r.type}-${r.value ?? i}`}
            label={r.value ? `${typeLabel(r.type)}: ${r.value}` : typeLabel(r.type)}
            onDelete={() => remove(i)}
          />
        ))}
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
        {FIXED_TYPES.map((type) => (
          <Button
            key={type}
            size="small"
            variant="outlined"
            disabled={value.some((r) => r.type === type)}
            onClick={() => addFixed(type)}
          >
            + {typeLabel(type)}
          </Button>
        ))}
      </Stack>

      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          select
          label={t("eventAutomation.addSpecific")}
          value={pendingType}
          onChange={(e) => setPendingType(e.target.value as RecipientType)}
          sx={{ minWidth: 180 }}
        >
          {VALUE_TYPES.map((type) => (
            <MenuItem key={type} value={type}>
              {typeLabel(type)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label={t("eventAutomation.value")}
          value={pendingValue}
          onChange={(e) => setPendingValue(e.target.value)}
          disabled={!pendingType}
        />
        <Button size="small" variant="contained" onClick={addWithValue} disabled={!pendingType || !pendingValue.trim()}>
          {t("common.add")}
        </Button>
      </Stack>
    </Box>
  );
}
