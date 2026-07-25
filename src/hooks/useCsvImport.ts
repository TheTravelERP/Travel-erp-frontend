// src/hooks/useCsvImport.ts
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "../components/ui/SnackbarProvider";
import { getErrorMessage } from "../utils/errorMessage";
import type { ImportResult } from "../components/common/ImportResultDialog";

// Shared logic behind every module's "Import CSV" button — upload, show a
// snackbar summary, surface per-row errors in a dialog, refresh the list.
// Mirrors EnquiryListPage.tsx's inline handleImport, lifted out since it
// was identical across every module that already had it.
export function useCsvImport(
  importFn: (file: File) => Promise<ImportResult>,
  onDone: () => void,
) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File) {
    try {
      setLoading(true);
      const res = await importFn(file);
      setResult(res);
      setDialogOpen(true);
      onDone();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.importFailed")), severity: "error" });
    } finally {
      setLoading(false);
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0]);
      e.target.value = "";
    }
  }

  return {
    fileInputRef,
    loading,
    result,
    dialogOpen,
    closeDialog: () => setDialogOpen(false),
    openFilePicker,
    onFileInputChange,
  };
}
