// src/features/booking/components/quickResolve/BookingPackagePanel.tsx
//
// Unified Package resolution UI for Booking — mirrors
// BookingCustomerPanel.tsx / QuotationPackagePanel.tsx exactly, swapping in
// Package specifics. Same component for Direct Booking and
// Booking-from-Enquiry; same popup (CreatePackageDialog) either way, blank
// or pre-filled from the Enquiry's package snapshot. Departure selection
// stays a separate field rendered alongside this panel in BookingForm.tsx —
// Quotation has no Departure concept, so there's nothing to mirror there.

import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useTranslation } from "react-i18next";

import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import EntityContextBar from "../../../../components/common/EntityContextBar";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import { linkExistingPackageForEnquiry } from "../../../enquiry/enquiry.api";
import type { EnquiryDetail } from "../../../enquiry/enquiry.types";
import CreatePackageDialog from "../../../package/components/CreatePackageDialog";
import { suggestPackageCode } from "../../../package/components/PackageQuickCreateFields";
import type { BookingFormInput } from "../../booking.types";

interface BookingPackagePanelProps {
  control: Control<BookingFormInput>;
  setValue: UseFormSetValue<BookingFormInput>;
  /** null => Direct Booking. Set => Booking-from-Enquiry — renders the
   *  snapshot card and pre-searches/pre-fills from it. */
  enquiry: EnquiryDetail | null;
  /** Only ever invoked when `enquiry` is set. */
  onEnquiryUpdated: (updated: EnquiryDetail) => void;
  disabled?: boolean;
  /** Sales Context is locked once a booking has left Draft (or was
   *  converted from a Quotation) — the field and the "Create New Package"
   *  shortcut both go read-only, independent of `isResolved`. */
  salesContextLocked?: boolean;
}

export default function BookingPackagePanel({
  control,
  setValue,
  enquiry,
  onEnquiryUpdated,
  disabled,
  salesContextLocked,
}: BookingPackagePanelProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linking, setLinking] = useState(false);

  // "Resolved" means a real backend link exists — the Enquiry itself
  // already carries a pkg_uuid, persisted via resolvePackage() below. A
  // Direct Booking's pkg_uuid is just live, unsaved form state and must
  // stay freely editable up to Save. Mirrors BookingCustomerPanel.tsx.
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
      {enquiry && !isResolved && !salesContextLocked && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
            {t("quotation.packageSnapshotTitle")}
          </Typography>
          <EntityContextBar
            fields={[
              { label: t("booking.package"), value: enquiry.package_name || "-" },
              { label: t("booking.businessType"), value: enquiry.business_type || "-" },
            ]}
          />
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
        <Box sx={{ flex: 1 }}>
          <EntityAutocomplete
            name="pkg_uuid"
            label={t("booking.package")}
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
            {t("common.createNew")} {t("booking.package")}
          </Button>
        )}
      </Box>

      <CreatePackageDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialValues={
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
