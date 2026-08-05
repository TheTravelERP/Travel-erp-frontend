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
}

export default function QuotationPackagePanel({
  control,
  setValue,
  enquiry,
  onEnquiryUpdated,
  disabled,
}: QuotationPackagePanelProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linking, setLinking] = useState(false);

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
      {enquiry && (
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
            disabled={disabled || linking}
            initialInputValue={enquiry?.package_name || undefined}
            onOptionSelected={(option) => {
              if (option) resolvePackage(option.value);
            }}
          />
        </Box>
        <Button size="small" variant="outlined" disabled={disabled || linking} onClick={() => setDialogOpen(true)}>
          {t("quotation.createNew")} {t("quotation.package")}
        </Button>
      </Box>

      <CreatePackageDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialValues={
          enquiry
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
