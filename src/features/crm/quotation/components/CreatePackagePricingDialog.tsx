// src/features/crm/quotation/components/CreatePackagePricingDialog.tsx
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  FormControlLabel,
  Switch,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../utils/errorMessage";
import { createPackagePricing, resolvePackagePricing } from "../../../package/packagePricing/packagePricing.api";
import type { PackagePricingResolveResult } from "../../../package/packagePricing/packagePricing.types";

const getDialogSchema = (t: (key: string) => string) =>
  z.object({
    occupancy_type: z.string().trim().min(1, t("packagePricing.validation.occupancyTypeRequired")),
    passenger_type: z.string().trim().min(1, t("packagePricing.validation.passengerTypeRequired")),
    price: z.coerce.number().min(0, t("packagePricing.validation.priceRequired")),
    effective_from: z.string().trim().min(1, t("packagePricing.validation.effectiveFromRequired")),
    effective_to: z.string().trim().optional(),
    is_default: z.boolean().optional(),
  });

type DialogValues = z.infer<ReturnType<typeof getDialogSchema>>;

interface CreatePackagePricingDialogProps {
  open: boolean;
  onClose: () => void;
  packageUuid: string;
  packageCurrency: string;
  priceAsOfDate: string;
  initialOccupancyType?: string;
  initialPassengerType?: string;
  onResolved: (occupancyType: string, passengerType: string, result: PackagePricingResolveResult) => void;
}

export default function CreatePackagePricingDialog({
  open,
  onClose,
  packageUuid,
  packageCurrency,
  priceAsOfDate,
  initialOccupancyType,
  initialPassengerType,
  onResolved,
}: CreatePackagePricingDialogProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);
  const schema = useMemo(() => getDialogSchema(t), [t]);

  const { control, handleSubmit, reset } = useForm<DialogValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      occupancy_type: initialOccupancyType || "",
      passenger_type: initialPassengerType || "",
      price: 0,
      effective_from: priceAsOfDate,
      effective_to: "",
      is_default: false,
    },
  });

  async function handleCreate(values: DialogValues) {
    setSaving(true);
    try {
      await createPackagePricing({
        package_uuid: packageUuid,
        occupancy_type: values.occupancy_type,
        passenger_type: values.passenger_type,
        price_category: "Normal",
        currency_code: packageCurrency,
        price: values.price,
        effective_from: values.effective_from,
        effective_to: values.effective_to || undefined,
        is_default: values.is_default,
        is_active: true,
      });

      // Re-run resolution for the combination that triggered the dialog so
      // the caller (Occupancy Group UI) can pick up the freshly created
      // price without a page navigation or re-submitting the whole quotation.
      const resolved = await resolvePackagePricing({
        package_uuid: packageUuid,
        occupancy_type: values.occupancy_type,
        passenger_type: values.passenger_type,
        price_as_of_date: priceAsOfDate,
      });

      onResolved(values.occupancy_type, values.passenger_type, resolved);
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t("quotation.createPricingDialogTitle")}</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2 }}>
          {t("packagePricing.currencyFromPackage")}: {packageCurrency}
        </Alert>
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
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
          <Grid size={{ xs: 6 }}>
            <Controller
              name="price"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="number"
                  label={t("packagePricing.price")}
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Box display="flex" alignItems="center" height="100%">
              <Controller
                name="is_default"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label={t("packagePricing.isDefault")}
                  />
                )}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Controller
              name="effective_from"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  type="date"
                  label={t("packagePricing.effectiveFrom")}
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Controller
              name="effective_to"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label={t("packagePricing.effectiveTo")}
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {t("common.cancel")}
        </Button>
        <Button variant="contained" disabled={saving} onClick={handleSubmit(handleCreate)}>
          {saving ? t("common.saving") : t("quotation.createPricingButton")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
