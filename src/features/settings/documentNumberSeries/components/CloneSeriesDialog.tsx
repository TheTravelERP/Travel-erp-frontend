// src/features/settings/documentNumberSeries/components/CloneSeriesDialog.tsx

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import type { CloneDocumentNumberSeriesInput } from "../documentNumberSeries.types";

interface CloneSeriesDialogProps {
  open: boolean;
  sourceSeriesName: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: CloneDocumentNumberSeriesInput) => void;
}

export default function CloneSeriesDialog({
  open,
  sourceSeriesName,
  loading = false,
  onClose,
  onConfirm,
}: CloneSeriesDialogProps) {
  const { t } = useTranslation();

  const [seriesName, setSeriesName] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [effectiveTo, setEffectiveTo] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [startingNumber, setStartingNumber] = useState<string>("");

  function handleConfirm() {
    onConfirm({
      series_name: seriesName,
      effective_from: effectiveFrom || undefined,
      effective_to: effectiveTo || undefined,
      is_default: isDefault,
      starting_number: startingNumber ? Number(startingNumber) : undefined,
    });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t("common.clone")} — {sourceSeriesName}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label={t("documentNumberSeries.seriesName")}
              fullWidth
              required
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              label={t("documentNumberSeries.effectiveFrom")}
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              label={t("documentNumberSeries.effectiveTo")}
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={effectiveTo}
              onChange={(e) => setEffectiveTo(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 6 }}>
            <TextField
              label={t("documentNumberSeries.startingNumber")}
              type="number"
              fullWidth
              value={startingNumber}
              onChange={(e) => setStartingNumber(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 6 }} sx={{ display: "flex", alignItems: "center" }}>
            <FormControlLabel
              control={<Switch checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />}
              label={t("documentNumberSeries.default")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.cancel")}</Button>
        <Button
          variant="contained"
          disabled={!seriesName.trim() || loading}
          onClick={handleConfirm}
        >
          {loading ? t("common.saving") : t("common.clone")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
