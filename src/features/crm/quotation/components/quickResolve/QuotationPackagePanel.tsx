// src/features/crm/quotation/components/quickResolve/QuotationPackagePanel.tsx
//
// Unified Package resolution UI for Quotation — mirrors
// QuotationCustomerPanel.tsx exactly, swapping in Package specifics. Same
// component for Direct Quotation and Quotation-from-Enquiry; same popup
// (CreatePackageDialog) either way, blank or pre-filled from the Enquiry's
// package snapshot.

import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useTranslation } from "react-i18next";

import EntityAutocomplete from "../../../../../components/common/EntityAutocomplete";
import EntityContextBar from "../../../../../components/common/EntityContextBar";
import { useSnackbar } from "../../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../../utils/errorMessage";
import { linkExistingPackageForEnquiry } from "../../../../enquiry/enquiry.api";
import type { EnquiryDetail } from "../../../../enquiry/enquiry.types";
import CreatePackageDialog from "../../../../package/components/CreatePackageDialog";
import { suggestPackageCode } from "../../../../package/components/PackageQuickCreateFields";
import type { QuotationFormInput } from "../../quotation.types";

interface QuotationPackagePanelProps {
  control: Control<QuotationFormInput>;
  setValue: UseFormSetValue<QuotationFormInput>;
  /** null => Direct Quotation. Set => Quotation-from-Enquiry — renders the
   *  snapshot card and pre-searches/pre-fills from it. */
  enquiry: EnquiryDetail | null;
  /** Only ever invoked when `enquiry` is set. */
  onEnquiryUpdated: (updated: EnquiryDetail) => void;
  disabled?: boolean;
  /** Quotation Edit screen only — Package is part of the quotation's
   *  locked Sales Context (see QuotationForm.tsx); the field and the
   *  "Create New Package" shortcut both go read-only, independent of
   *  `isResolved`. A new quotation is required to change the package. */
  salesContextLocked?: boolean;
}

export default function QuotationPackagePanel({
  control,
  setValue,
  enquiry,
  onEnquiryUpdated,
  disabled,
  salesContextLocked,
}: QuotationPackagePanelProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linking, setLinking] = useState(false);

  // "Resolved" means a real backend link exists — the Enquiry itself
  // already carries a pkg_uuid, persisted via resolvePackage() below. A
  // Direct Quotation's pkg_uuid is just live, unsaved form state and must
  // stay freely editable up to Save. Mirrors QuotationCustomerPanel.tsx.
  const isResolved = !!enquiry?.pkg_uuid;

  async function resolvePackage(pkgUuid: string) {
    if (!enquiry) return;
    setLinking(true);
    try {
      const updated = await linkExistingPackageForEnquiry(enquiry.uuid, pkgUuid);
      onEnquiryUpdated(updated);
      showSnackbar({ message: t("quotation.packageLinked"), severity: "success" });
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setLinking(false);
    }
  }

  return (
    <Stack spacing={1.5}>
      {/* Mirrors QuotationCustomerPanel.tsx: the snapshot card exists to
          help decide whether to link/create a Package from the enquiry's
          raw text — moot once edit mode has already locked that decision,
          and confusing here in particular since a Direct Quotation's
          bookkeeping enquiry never carries a package link at all, so this
          card would show "-" even when the field below has a real package. */}
      {enquiry && !isResolved && !salesContextLocked && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
            {t("quotation.packageSnapshotTitle")}
          </Typography>
          <EntityContextBar
            fields={[
              { label: t("quotation.package"), value: enquiry.package_name || "-" },
              { label: t("quotation.businessType"), value: enquiry.business_type || "-" },
            ]}
          />
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
        <Box sx={{ flex: 1 }}>
          <EntityAutocomplete
            name="pkg_uuid"
            label={t("quotation.packageMasterSection")}
            control={control}
            setValue={setValue}
            dropdownName="packages"
            disabled={disabled || linking || isResolved || salesContextLocked}
            initialInputValue={enquiry?.package_name || undefined}
            onOptionSelected={(option) => {
              if (option) resolvePackage(option.value);
            }}
          />
        </Box>
        {!isResolved && !salesContextLocked && (
          <Button size="small" variant="outlined" disabled={disabled || linking} onClick={() => setDialogOpen(true)}>
            {t("common.createNew")} {t("quotation.package")}
          </Button>
        )}
      </Box>

      <CreatePackageDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialValues={
          // Only pre-fill from the Enquiry's package snapshot before a real
          // Package is linked — once pkg_uuid is set (existing link or a
          // prior "Create New"), that snapshot text is stale and re-showing
          // it here (with everything else blank) reads as a broken form
          // rather than a fresh "create another package" dialog.
          enquiry && !enquiry.pkg_uuid
            ? { name: enquiry.package_name || "", code: suggestPackageCode(enquiry.package_name || "") }
            : undefined
        }
        onCreated={(pkg) => {
          if (!enquiry) {
            setValue("pkg_uuid", pkg.uuid, { shouldValidate: true });
          } else {
            resolvePackage(pkg.uuid);
          }
          setDialogOpen(false);
        }}
      />
    </Stack>
  );
}
