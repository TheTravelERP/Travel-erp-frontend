// src/features/settings/location/components/AddStateProvinceDialog.tsx
// Deliberately minimal — a single dialog with Code + Name, Country shown
// read-only (inherited from whatever the Location form's Country field is
// currently set to). Not a wizard: one step, two fields.
//
// Phase 4B: renamed from AddCityDialog (City -> State/Province business
// rename). Still calls the unchanged createStateProvince() wrapper around
// POST /api/v1/cities — see stateProvince.api.ts's header comment.
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

import { createStateProvince } from "../../stateProvinceMaster/stateProvince.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

interface AddStateProvinceDialogProps {
  open: boolean;
  countryCode: string;
  countryLabel?: string;
  onClose: () => void;
  onCreated: (stateProvince: { uuid: string; city_code: string; name: string }) => void;
}

export default function AddStateProvinceDialog({
  open,
  countryCode,
  countryLabel,
  onClose,
  onCreated,
}: AddStateProvinceDialogProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!code.trim() || !name.trim()) return;

    try {
      setSaving(true);
      const stateProvince = await createStateProvince({ country_code: countryCode, city_code: code.trim(), name: name.trim() });
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      onCreated(stateProvince);
      setCode("");
      setName("");
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.createFailed")), severity: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("location.addStateProvince")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {t("common.country")}: {countryLabel || countryCode}
          </Typography>
          <TextField
            label={t("common.code")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label={t("common.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {t("common.cancel")}
        </Button>
        <Button variant="contained" onClick={handleCreate} disabled={saving || !code.trim() || !name.trim()}>
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
