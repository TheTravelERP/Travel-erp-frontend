// src/features/crm/quotation/components/resolveLinks/ResolveCustomerLink.tsx
import { useState } from "react";
import { Box, Button, Grid, Stack, TextField } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";

import EntityAutocomplete from "../../../../../components/common/EntityAutocomplete";
import ResolveLinkShell from "./ResolveLinkShell";
import { useSnackbar } from "../../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../../utils/errorMessage";
import { MOBILE_NUMBER_REGEX } from "../../../../../utils/validator";
import { createCustomer } from "../../../../customer/customer.api";
import { linkExistingCustomerForEnquiry } from "../../../../enquiry/enquiry.api";
import type { EnquiryDetail } from "../../../../enquiry/enquiry.types";

const getInlineCustomerSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().trim().min(1, t("validation.nameRequired")),
    mobile: z
      .string()
      .trim()
      .min(1, t("validation.mobileRequired"))
      .refine((v) => MOBILE_NUMBER_REGEX.test(v), t("validation.internationalMobile")),
    email: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), { message: t("validation.emailInvalid") }),
  });

type InlineCustomerValues = z.infer<ReturnType<typeof getInlineCustomerSchema>>;

interface ResolveCustomerLinkProps {
  enquiry: EnquiryDetail;
  onResolved: (updated: EnquiryDetail) => void;
  disabled?: boolean;
}

export default function ResolveCustomerLink({ enquiry, onResolved, disabled }: ResolveCustomerLinkProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const [selectedCustUuid, setSelectedCustUuid] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [creating, setCreating] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<InlineCustomerValues>({
    resolver: zodResolver(getInlineCustomerSchema(t)),
    defaultValues: {
      name: enquiry.customer_name || "",
      mobile: enquiry.customer_mobile || "",
      email: enquiry.customer_email || "",
    },
  });

  async function handleLinkExisting() {
    if (!selectedCustUuid) return;
    setLinking(true);
    try {
      const updated = await linkExistingCustomerForEnquiry(enquiry.uuid, selectedCustUuid);
      onResolved(updated);
      showSnackbar({ message: t("quotation.customerLinked"), severity: "success" });
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setLinking(false);
    }
  }

  async function handleCreateNew(values: InlineCustomerValues) {
    setCreating(true);
    try {
      const customer = await createCustomer({
        name: values.name,
        mobile: values.mobile,
        email: values.email || undefined,
      });
      const updated = await linkExistingCustomerForEnquiry(enquiry.uuid, customer.uuid);
      onResolved(updated);
      showSnackbar({
        message: t("quotation.customerCreatedAndLinked", { name: customer.name }),
        severity: "success",
      });
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.createFailed")), severity: "error" });
    } finally {
      setCreating(false);
    }
  }

  return (
    <ResolveLinkShell
      title={t("quotation.customerSectionTitle")}
      statusLabel={t("quotation.notLinkedStatus")}
      pendingMessage={t("quotation.customerPendingMessage")}
      snapshotFields={[
        { label: t("common.customerName"), value: enquiry.customer_name || "" },
        { label: t("common.mobile"), value: enquiry.customer_mobile || "" },
        { label: t("common.email"), value: enquiry.customer_email || "" },
      ]}
      resolved={!!enquiry.cust_uuid}
      resolvedName={enquiry.customer_name || ""}
      resolvedCaption={t("quotation.linkedToCustomerMaster")}
      disabled={disabled}
      linkExisting={
        <Stack spacing={1.5}>
          <EntityAutocomplete
            name="link_existing_customer"
            label={t("quotation.customerMasterSection")}
            dropdownName="customers"
            useForm={false}
            value={selectedCustUuid}
            onChange={setSelectedCustUuid}
          />
          <Box display="flex" justifyContent="flex-end">
            <Button
              size="small"
              variant="contained"
              disabled={!selectedCustUuid || linking}
              onClick={handleLinkExisting}
            >
              {linking ? t("common.saving") : t("quotation.linkButton")}
            </Button>
          </Box>
        </Stack>
      }
      createNew={
        <Box>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("common.customerName")}
                    size="small"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="mobile"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("common.mobile")}
                    size="small"
                    fullWidth
                    error={!!errors.mobile}
                    helperText={errors.mobile?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("common.email")}
                    size="small"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
              <Button
                type="button"
                size="small"
                variant="contained"
                disabled={creating}
                onClick={handleSubmit(handleCreateNew)}
              >
                {creating ? t("common.saving") : t("common.save")}
              </Button>
            </Grid>
          </Grid>
        </Box>
      }
    />
  );
}
