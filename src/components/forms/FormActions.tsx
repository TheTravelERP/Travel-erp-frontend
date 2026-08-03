// src/components/forms/FormActions.tsx
import type { ReactNode } from "react";
import { Box, Button, Divider, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

interface FormActionsProps {
  onBack: () => void;
  onDiscard: () => void;
  submitting?: boolean;
  saveLabel?: string;
  savingLabel?: string;
  /** Disables Save independent of `submitting` — e.g. while required
   * cross-entity links (Customer/Package master) are still unresolved. */
  saveDisabled?: boolean;
  /** Shown next to Save whenever `saveDisabled` is true, so the user never
   * has to guess why they can't submit (e.g. "Waiting for: Package"). */
  saveDisabledReason?: ReactNode;
}

export default function FormActions({
  onBack,
  onDiscard,
  submitting = false,
  saveLabel,
  savingLabel,
  saveDisabled = false,
  saveDisabledReason,
}: FormActionsProps) {
  const { t } = useTranslation();

  return (
    <Grid size={{ xs: 12 }}>
      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
        <Button variant="outlined" onClick={onBack}>
          {t("common.back")}
        </Button>

        <Box display="flex" alignItems="center" gap={2}>
          {saveDisabled && saveDisabledReason && (
            <Typography variant="body2" color="warning.main">
              {saveDisabledReason}
            </Typography>
          )}

          <Button variant="outlined" color="error" onClick={onDiscard} size="large">
            {t("common.discard")}
          </Button>

          <Button type="submit" variant="contained" size="large" disabled={submitting || saveDisabled}>
            {submitting ? (savingLabel ?? t("common.saving")) : (saveLabel ?? t("common.save"))}
          </Button>
        </Box>
      </Box>
    </Grid>
  );
}
