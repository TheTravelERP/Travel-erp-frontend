// src/components/common/ConfirmDialog.tsx

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useTranslation } from "react-i18next";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText,
  cancelText,
  loading = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("common.confirm");
  const resolvedConfirmText = confirmText ?? t("common.delete");
  const resolvedCancelText = cancelText ?? t("common.cancel");

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{resolvedTitle}</DialogTitle>

      <DialogContent>
        <DialogContentText>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
        >
          {resolvedCancelText}
        </Button>

        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? t("common.deleting") : resolvedConfirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}