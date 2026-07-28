// src/features/settings/notificationTemplates/components/PlaceholderHelperPanel.tsx

import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { TEMPLATE_PLACEHOLDERS } from "../notificationTemplate.placeholders";

interface Props {
  onInsert: (placeholder: string) => void;
}

export default function PlaceholderHelperPanel({ onInsert }: Props) {
  const { t } = useTranslation();

  return (
    <Paper variant="outlined" sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" gutterBottom>
        {t("notificationTemplate.placeholders")}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
        {t("notificationTemplate.placeholdersHelper")}
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {TEMPLATE_PLACEHOLDERS.map((p) => (
          <Chip
            key={p.key}
            size="small"
            label={`{{${p.key}}}`}
            title={p.label}
            onClick={() => onInsert(`{{${p.key}}}`)}
            sx={{ cursor: "pointer" }}
          />
        ))}
      </Box>
    </Paper>
  );
}
