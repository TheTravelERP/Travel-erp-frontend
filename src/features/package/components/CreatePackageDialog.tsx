// src/features/package/components/CreatePackageDialog.tsx
//
// "Create New Package" dialog for the Direct Quotation flow — triggered via
// EntityAutocomplete's built-in allowAdd/onAddNew on a bare pkg_uuid field
// (no Enquiry involved, unlike ResolvePackageLink.tsx which links the
// created package onto an Enquiry). Shares the exact same schema, field
// layout, createPackage API call, and Package Type quick-create dialog as
// the Enquiry-linked flow via PackageQuickCreateFields/CreatePackageTypeDialog
// — only what happens after creation differs (here: hand the new package
// back to the caller to select directly onto a form field).

import { useEffect, useRef, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../utils/errorMessage";
import { createPackage } from "../package.api";
import CreatePackageTypeDialog from "./CreatePackageTypeDialog";
import PackageQuickCreateFields, {
  getPackageQuickCreateSchema,
  type PackageQuickCreateValues,
} from "./PackageQuickCreateFields";

const blankValues: PackageQuickCreateValues = {
  name: "",
  code: "",
  package_type_uuid: null,
  currency_code: "",
};

interface CreatePackageDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (pkg: { uuid: string; name: string }) => void;
  /** Pre-fills the popup from an Enquiry's package snapshot (Quotation-from-Enquiry) —
   *  omitted for a blank popup (Direct Quotation). Same dialog either way. */
  initialValues?: Partial<PackageQuickCreateValues>;
}

export default function CreatePackageDialog({ open, onClose, onCreated, initialValues }: CreatePackageDialogProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [creating, setCreating] = useState(false);
  const [packageTypeDialogOpen, setPackageTypeDialogOpen] = useState(false);
  const codeManuallyEdited = useRef(false);

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PackageQuickCreateValues>({
    resolver: zodResolver(getPackageQuickCreateSchema(t)),
    defaultValues: { ...blankValues, ...initialValues },
  });

  // The dialog stays mounted across opens — reset to the current
  // blank-vs-prefilled state (and let the code-suggestion-follows-name
  // behavior restart) every time it opens.
  useEffect(() => {
    if (open) {
      codeManuallyEdited.current = false;
      reset({ ...blankValues, ...initialValues });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleCreate(values: PackageQuickCreateValues) {
    setCreating(true);
    try {
      // Bare Package only — see the boundary comment in
      // PackageQuickCreateFields.tsx. A quotation built against this
      // package resolves via the Flat Package Pricing fallback (Occupancy
      // Group UI) rather than copied service lines.
      const pkg = await createPackage({
        name: values.name,
        code: values.code,
        package_type_uuid: values.package_type_uuid || undefined,
        currency_code: values.currency_code,
      });
      onCreated({ uuid: pkg.uuid, name: pkg.name });
      showSnackbar({
        message: t("quotation.packageCreatedAndLinked", { name: pkg.name }),
        severity: "success",
      });
      reset();
      onClose();
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.createFailed")), severity: "error" });
    } finally {
      setCreating(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("common.add")} {t("quotation.package")}</DialogTitle>
      <DialogContent>
        <PackageQuickCreateFields
          control={control}
          setValue={setValue}
          errors={errors}
          onPackageTypeAddNew={() => setPackageTypeDialogOpen(true)}
          codeManuallyEditedRef={codeManuallyEdited}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={creating}>{t("common.cancel")}</Button>
        <Button variant="contained" disabled={creating} onClick={handleSubmit(handleCreate)}>
          {creating ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>

      <CreatePackageTypeDialog
        open={packageTypeDialogOpen}
        onClose={() => setPackageTypeDialogOpen(false)}
        onCreated={(option) => setValue("package_type_uuid", option.value, { shouldValidate: true })}
      />
    </Dialog>
  );
}
