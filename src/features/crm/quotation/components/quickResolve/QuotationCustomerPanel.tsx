// src/features/crm/quotation/components/quickResolve/QuotationCustomerPanel.tsx
//
// Unified Customer resolution UI for Quotation — same component for both
// Direct Quotation (no enquiry) and Quotation-from-Enquiry. Search-only
// EntityAutocomplete (no inline "Add" option) + a "Create New Customer"
// button that always opens the same CreateCustomerDialog, blank or
// pre-filled from the Enquiry's customer snapshot. Deliberately a new,
// Quotation-local component — CustomerSelector.tsx (Booking/Enquiry's own
// customer capture UI) is untouched.

import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import type { Control, UseFormSetValue } from "react-hook-form";
import { useTranslation } from "react-i18next";

import EntityAutocomplete from "../../../../../components/common/EntityAutocomplete";
import EntityContextBar from "../../../../../components/common/EntityContextBar";
import { useSnackbar } from "../../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../../utils/errorMessage";
import { linkExistingCustomerForEnquiry } from "../../../../enquiry/enquiry.api";
import type { EnquiryDetail } from "../../../../enquiry/enquiry.types";
import CreateCustomerDialog from "../../../../customer/components/CreateCustomerDialog";
import type { QuotationFormInput } from "../../quotation.types";

interface QuotationCustomerPanelProps {
  control: Control<QuotationFormInput>;
  setValue: UseFormSetValue<QuotationFormInput>;
  /** null => Direct Quotation. Set => Quotation-from-Enquiry — renders the
   *  snapshot card and pre-searches/pre-fills from it. */
  enquiry: EnquiryDetail | null;
  /** Only ever invoked when `enquiry` is set. */
  onEnquiryUpdated: (updated: EnquiryDetail) => void;
  disabled?: boolean;
  /** Quotation Edit screen only — Customer is part of the quotation's
   *  locked Sales Context (see QuotationForm.tsx); the field and the
   *  "Create New Customer" shortcut both go read-only, independent of
   *  `isResolved`. A new quotation is required to change the customer. */
  salesContextLocked?: boolean;
}

export default function QuotationCustomerPanel({
  control,
  setValue,
  enquiry,
  onEnquiryUpdated,
  disabled,
  salesContextLocked,
}: QuotationCustomerPanelProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [linking, setLinking] = useState(false);

  // "Resolved" means a real backend link exists — the Enquiry itself
  // already carries a cust_uuid, persisted via resolveCustomer() below.
  // Only then are the snapshot/Create-New shortcut redundant and the field
  // safe to lock (the way back is "edit the enquiry"). A Direct Quotation's
  // cust_uuid is just live, unsaved form state — same as any other field —
  // so it must stay freely editable right up to Save; locking it here would
  // trap a wrong pick with no persisted record to go fix.
  const isResolved = !!enquiry?.cust_uuid;

  // Direct Quotation: the EntityAutocomplete's own Controller binding
  // already wrote cust_uuid — nothing else to persist. Quotation-from-
  // Enquiry: the Enquiry itself must be linked to a real Customer before
  // the Quotation can be submitted (backend requires enquiry.cust_id), so
  // linking happens immediately here rather than being deferred to submit.
  async function resolveCustomer(custUuid: string) {
    if (!enquiry) return;
    setLinking(true);
    try {
      const updated = await linkExistingCustomerForEnquiry(enquiry.uuid, custUuid);
      onEnquiryUpdated(updated);
      showSnackbar({ message: t("quotation.customerLinked"), severity: "success" });
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setLinking(false);
    }
  }

  return (
    <Stack spacing={1.5}>
      {/* The snapshot card exists to help a user decide whether to link the
          enquiry's raw customer text to an existing Customer or create a
          new one — a decision that's already made and locked in edit mode,
          so it would just be a second, possibly-stale copy of what the
          (now-disabled) field below already shows. */}
      {enquiry && !isResolved && !salesContextLocked && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
            {t("quotation.customerSnapshotTitle")}
          </Typography>
          <EntityContextBar
            fields={[
              { label: t("common.customerName"), value: enquiry.customer_name || "-" },
              { label: t("common.mobile"), value: enquiry.customer_mobile || "-" },
              { label: t("common.email"), value: enquiry.customer_email || "-" },
            ]}
          />
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
        <Box sx={{ flex: 1 }}>
          <EntityAutocomplete
            name="cust_uuid"
            label={t("quotation.customerMasterSection")}
            control={control}
            setValue={setValue}
            dropdownName="customers"
            disabled={disabled || linking || isResolved || salesContextLocked}
            initialInputValue={enquiry?.customer_name || undefined}
            onOptionSelected={(option) => {
              if (option) resolveCustomer(option.value);
            }}
          />
        </Box>
        {!isResolved && !salesContextLocked && (
          <Button size="small" variant="outlined" disabled={disabled || linking} onClick={() => setDialogOpen(true)}>
            {t("quotation.createNew")} {t("common.customer")}
          </Button>
        )}
      </Box>

      <CreateCustomerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialValues={
          // Only pre-fill from the Enquiry's customer snapshot before a real
          // Customer is linked — once cust_uuid is set (existing link or a
          // prior "Create New"), that snapshot text is stale and re-showing
          // it here reads as a broken form rather than a fresh "create
          // another customer" dialog. Mirrors QuotationPackagePanel.tsx.
          enquiry && !enquiry.cust_uuid
            ? {
                name: enquiry.customer_name || "",
                mobile: enquiry.customer_mobile || "",
                email: enquiry.customer_email || "",
              }
            : undefined
        }
        onCreated={(customer) => {
          if (!enquiry) {
            setValue("cust_uuid", customer.uuid, { shouldValidate: true });
          } else {
            resolveCustomer(customer.uuid);
          }
          setDialogOpen(false);
        }}
      />
    </Stack>
  );
}
