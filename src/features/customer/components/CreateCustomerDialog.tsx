// src/features/customer/components/CreateCustomerDialog.tsx
//
// "Create New Customer" dialog — the single reusable popup for Quotation's
// Customer resolution panel (QuotationCustomerPanel.tsx), used both for
// Direct Quotation (blank) and Quotation-from-Enquiry (pre-filled from the
// Enquiry's customer snapshot via `initialValues`). Mirrors
// features/package/components/CreatePackageDialog.tsx's shape exactly —
// same schema/field-layout/API-call/reset-on-reopen pattern, just for
// Customer instead of Package.

import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../utils/errorMessage";
import { createCustomer } from "../customer.api";
import CustomerQuickCreateFields, {
  getCustomerQuickCreateSchema,
  type CustomerQuickCreateValues,
} from "./CustomerQuickCreateFields";

const blankValues: CustomerQuickCreateValues = { name: "", mobile: "", email: "" };

interface CreateCustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (customer: { uuid: string; name: string }) => void;
  initialValues?: Partial<CustomerQuickCreateValues>;
}

export default function CreateCustomerDialog({ open, onClose, onCreated, initialValues }: CreateCustomerDialogProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [creating, setCreating] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerQuickCreateValues>({
    resolver: zodResolver(getCustomerQuickCreateSchema(t)),
    defaultValues: { ...blankValues, ...initialValues },
  });

  // The dialog stays mounted across opens — reset to the current
  // blank-vs-prefilled state every time it opens, so Direct Quotation
  // (blank) and Quotation-from-Enquiry (snapshot-prefilled) never leak
  // stale values from a previous open/cancel into each other.
  useEffect(() => {
    if (open) reset({ ...blankValues, ...initialValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleCreate(values: CustomerQuickCreateValues) {
    setCreating(true);
    try {
      const customer = await createCustomer({
        name: values.name,
        mobile: values.mobile,
        email: values.email || undefined,
      });
      onCreated({ uuid: customer.uuid, name: customer.name });
      showSnackbar({
        message: t("quotation.customerCreatedAndLinked", { name: customer.name }),
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
      <DialogTitle>{t("common.add")} {t("common.customer")}</DialogTitle>
      <DialogContent>
        <CustomerQuickCreateFields control={control} errors={errors} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={creating}>{t("common.cancel")}</Button>
        <Button variant="contained" disabled={creating} onClick={handleSubmit(handleCreate)}>
          {creating ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
