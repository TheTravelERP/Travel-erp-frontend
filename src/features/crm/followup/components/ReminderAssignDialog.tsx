// src/features/crm/followup/components/ReminderAssignDialog.tsx
import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useTranslation } from "react-i18next";

import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import { assignFollowup } from "../followup.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";

interface Props {
  uuid: string | null;
  onClose: () => void;
  onDone: () => void;
}

export default function ReminderAssignDialog({ uuid, onClose, onDone }: Props) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const [assignedUserUuid, setAssignedUserUuid] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setAssignedUserUuid(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!uuid || !assignedUserUuid) return;

    setSaving(true);
    try {
      await assignFollowup(uuid, assignedUserUuid);
      showSnackbar({ message: t("followup.assignSuccess"), severity: "success" });
      onDone();
      handleClose();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("followup.assignFailed")), severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(uuid)} onClose={saving ? undefined : handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("followup.assign")}</DialogTitle>
      <DialogContent>
        <EntityAutocomplete
          name="assigned_user_uuid"
          label={t("followup.assignedUser")}
          dropdownName="users"
          useForm={false}
          value={assignedUserUuid}
          onChange={setAssignedUserUuid}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={saving}>
          {t("common.cancel")}
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving || !assignedUserUuid}>
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
