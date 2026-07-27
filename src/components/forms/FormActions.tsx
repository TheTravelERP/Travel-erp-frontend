// src/components/forms/FormActions.tsx
import { Box, Button, Divider, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";

interface FormActionsProps {
  onBack: () => void;
  onDiscard: () => void;
  submitting?: boolean;
  saveLabel?: string;
  savingLabel?: string;
}

export default function FormActions({
  onBack,
  onDiscard,
  submitting = false,
  saveLabel,
  savingLabel,
}: FormActionsProps) {
  const { t } = useTranslation();

  return (
    <Grid size={{ xs: 12 }}>
      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={onBack}>
          {t("common.back")}
        </Button>

        <Box display="flex" gap={2}>
          <Button variant="outlined" color="error" onClick={onDiscard} size="large">
            {t("common.discard")}
          </Button>

          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {submitting ? (savingLabel ?? t("common.saving")) : (saveLabel ?? t("common.save"))}
          </Button>
        </Box>
      </Box>
    </Grid>
  );
}
