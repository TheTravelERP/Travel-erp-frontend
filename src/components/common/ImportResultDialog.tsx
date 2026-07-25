// src/components/common/ImportResultDialog.tsx

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from "@mui/material";
import { useTranslation } from "react-i18next";

export interface ImportResult {
  total_rows: number;
  imported: number;
  failed: number;
  errors: { row: number | null; error: string }[];
}

interface ImportResultDialogProps {
  open: boolean;
  result: ImportResult | null;
  onClose: () => void;
}

// Shows the per-row error detail Enquiry's import silently drops — the
// aggregate snackbar only says "45 of 50 imported (5 failed)" with no way
// to see which rows or why. Used by every module's import flow.
export default function ImportResultDialog({ open, result, onClose }: ImportResultDialogProps) {
  const { t } = useTranslation();

  if (!result) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("common.importCsv")}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {result.failed > 0
            ? t("common.importedSummary", {
                imported: result.imported,
                total: result.total_rows,
                failed: result.failed,
              })
            : t("common.importedSuccess", { count: result.imported })}
        </Typography>

        {result.errors.length > 0 && (
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 320 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width={80}>{t("common.row")}</TableCell>
                  <TableCell>{t("common.error")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.errors.map((e, i) => (
                  <TableRow key={i}>
                    <TableCell>{e.row ?? "-"}</TableCell>
                    <TableCell>{e.error}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          {t("common.close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
