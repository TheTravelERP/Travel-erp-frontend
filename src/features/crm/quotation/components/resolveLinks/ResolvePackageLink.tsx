// src/features/crm/quotation/components/resolveLinks/ResolvePackageLink.tsx
import { useRef, useState } from "react";
import { Box, Button, Grid, Stack, TextField } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";

import DropdownAutocomplete from "../../../../../components/common/DropdownAutocomplete";
import EntityAutocomplete from "../../../../../components/common/EntityAutocomplete";
import ResolveLinkShell from "./ResolveLinkShell";
import { useSnackbar } from "../../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../../utils/errorMessage";
import { createPackage } from "../../../../package/package.api";
import { createPackagePricing } from "../../../../package/packagePricing/packagePricing.api";
import { linkExistingPackageForEnquiry } from "../../../../enquiry/enquiry.api";
import type { EnquiryDetail } from "../../../../enquiry/enquiry.types";

// Quotation attachment requires the package to already have exactly one
// default price row (see build_package_snapshot on the backend) — without
// occupancy_type/passenger_type/price collected right here, this quick-create
// used to produce a Package with zero pricing rows, which then only surfaced
// as a cryptic "0 default price rows" error at Quotation Save time, several
// steps removed from where the package was actually created.
const getInlinePackageSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().trim().min(1, t("validation.nameRequired")),
    code: z.string().trim().min(1, t("validation.codeRequired")),
    currency_code: z.string().trim().length(3, t("quotation.validation.currencyCode3")),
    occupancy_type: z.string().trim().min(1, t("packagePricing.validation.occupancyTypeRequired")),
    passenger_type: z.string().trim().min(1, t("packagePricing.validation.passengerTypeRequired")),
    price: z.coerce.number().min(0, t("packagePricing.validation.priceRequired")),
  });

type InlinePackageValues = z.infer<ReturnType<typeof getInlinePackageSchema>>;

// Purely a client-side convenience suggestion — the backend still owns
// uniqueness (409/400 on a duplicate code), this never needs to be authoritative.
function suggestCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

interface ResolvePackageLinkProps {
  enquiry: EnquiryDetail;
  onResolved: (updated: EnquiryDetail) => void;
  disabled?: boolean;
}

export default function ResolvePackageLink({ enquiry, onResolved, disabled }: ResolvePackageLinkProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const [selectedPkgUuid, setSelectedPkgUuid] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [creating, setCreating] = useState(false);
  const codeManuallyEdited = useRef(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InlinePackageValues>({
    resolver: zodResolver(getInlinePackageSchema(t)),
    defaultValues: {
      name: enquiry.package_name || "",
      code: suggestCode(enquiry.package_name || ""),
      currency_code: "INR",
      occupancy_type: "",
      passenger_type: "",
      price: 0,
    },
  });

  async function handleLinkExisting() {
    if (!selectedPkgUuid) return;
    setLinking(true);
    try {
      const updated = await linkExistingPackageForEnquiry(enquiry.uuid, selectedPkgUuid);
      onResolved(updated);
      showSnackbar({ message: t("quotation.packageLinked"), severity: "success" });
    } catch (err: any) {
      showSnackbar({ message: getErrorMessage(err, t("common.updateFailed")), severity: "error" });
    } finally {
      setLinking(false);
    }
  }

  async function handleCreateNew(values: InlinePackageValues) {
    setCreating(true);
    try {
      const pkg = await createPackage({
        name: values.name,
        code: values.code,
        currency_code: values.currency_code,
      });
      // The package this quick-create produces must be immediately usable on
      // a quotation, so its one pricing row is created as the default —
      // effective_from is today since there's no separate reason to backdate it.
      await createPackagePricing({
        package_uuid: pkg.uuid,
        occupancy_type: values.occupancy_type,
        passenger_type: values.passenger_type,
        price_category: "Normal",
        currency_code: values.currency_code,
        price: values.price,
        effective_from: new Date().toISOString().slice(0, 10),
        is_default: true,
        is_active: true,
      });
      const updated = await linkExistingPackageForEnquiry(enquiry.uuid, pkg.uuid);
      onResolved(updated);
      showSnackbar({
        message: t("quotation.packageCreatedAndLinked", { name: pkg.name }),
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
      title={t("quotation.packageSectionTitle")}
      statusLabel={t("quotation.notLinkedStatus")}
      pendingMessage={t("quotation.packagePendingMessage")}
      snapshotFields={[{ label: t("quotation.package"), value: enquiry.package_name || "" }]}
      resolved={!!enquiry.pkg_uuid}
      resolvedName={enquiry.package_name || ""}
      resolvedCaption={t("quotation.linkedToPackageMaster")}
      disabled={disabled}
      linkExisting={
        <Stack spacing={1.5}>
          <EntityAutocomplete
            name="link_existing_package"
            label={t("quotation.packageMasterSection")}
            dropdownName="packages"
            useForm={false}
            value={selectedPkgUuid}
            onChange={setSelectedPkgUuid}
          />
          <Box display="flex" justifyContent="flex-end">
            <Button
              size="small"
              variant="contained"
              disabled={!selectedPkgUuid || linking}
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
                    label={t("quotation.package")}
                    size="small"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      if (!codeManuallyEdited.current) {
                        setValue("code", suggestCode(e.target.value));
                      }
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 5 }}>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("common.code")}
                    size="small"
                    fullWidth
                    error={!!errors.code}
                    helperText={errors.code?.message}
                    onChange={(e) => {
                      codeManuallyEdited.current = true;
                      field.onChange(e);
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 3 }}>
              <Controller
                name="currency_code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("quotation.currencyCode")}
                    size="small"
                    fullWidth
                    error={!!errors.currency_code}
                    helperText={errors.currency_code?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label={t("packagePricing.price")}
                    size="small"
                    fullWidth
                    error={!!errors.price}
                    helperText={errors.price?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <DropdownAutocomplete
                name="occupancy_type"
                label={t("packagePricing.occupancyType")}
                control={control}
                dropdownName="occupancy_type"
                useForm
                allowAdd={false}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <DropdownAutocomplete
                name="passenger_type"
                label={t("packagePricing.passengerType")}
                control={control}
                dropdownName="passenger_type"
                useForm
                allowAdd={false}
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
