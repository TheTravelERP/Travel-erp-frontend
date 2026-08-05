// src/features/package/components/CreatePackageTypeDialog.tsx
//
// Quick-create dialog for a Package Type, used wherever a Package Type
// EntityAutocomplete's "Add new" is triggered (Quick Create Package flows —
// see PackageQuickCreateFields.tsx). Extracted out of
// quotation/components/resolveLinks/ResolvePackageLink.tsx so both that
// component and the Direct Quotation Create Package dialog share the exact
// same implementation instead of duplicating it.

import { useRef, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";

import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../utils/errorMessage";
import { createPackageType } from "../packageType/packageType.api";

const getInlinePackageTypeSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().trim().min(1, t("packageType.validation.nameRequired")),
    code: z.string().trim().min(1, t("packageType.validation.codeRequired")),
    category: z.string().trim().min(1, t("packageType.validation.categoryRequired")),
  });

type InlinePackageTypeValues = z.infer<ReturnType<typeof getInlinePackageTypeSchema>>;

interface CreatePackageTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (option: { label: string; value: string }) => void;
}

export default function CreatePackageTypeDialog({
  open,
  onClose,
  onCreated,
}: CreatePackageTypeDialogProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);
  const schema = getInlinePackageTypeSchema(t);
  const codeManuallyEdited = useRef(false);

  const { control, handleSubmit, setValue, reset } = useForm<InlinePackageTypeValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", code: "", category: "General" },
  });

  async function handleCreate(values: InlinePackageTypeValues) {
    setSaving(true);
    try {
      const created = await createPackageType(values);
      onCreated({ label: created.name, value: created.uuid });
      showSnackbar({ message: t("common.createdSuccess"), severity: "success" });
      reset();
      onClose();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.createFailed")), severity: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("common.add")} {t("package.packageType")}</DialogTitle>
      <DialogContent>
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("packageType.name")}
                  size="small"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  onChange={(e) => {
                    field.onChange(e);
                    if (!codeManuallyEdited.current) {
                      setValue("code", e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "")
                        .slice(0, 50));
                    }
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Controller
              name="code"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("packageType.code")}
                  size="small"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  onChange={(e) => {
                    codeManuallyEdited.current = true;
                    field.onChange(e);
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Controller
              name="category"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("packageType.category")}
                  size="small"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>{t("common.cancel")}</Button>
        <Button variant="contained" disabled={saving} onClick={handleSubmit(handleCreate)}>
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
