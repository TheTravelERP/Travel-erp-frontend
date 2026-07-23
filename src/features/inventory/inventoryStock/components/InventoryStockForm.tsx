// src/features/inventory/inventoryStock/components/InventoryStockForm.tsx

import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Switch,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { getInventoryStockSchema } from "../inventoryStock.schema";
import type { InventoryStockFormInput } from "../inventoryStock.types";
import EntityAutocomplete from "../../../../components/common/EntityAutocomplete";
import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { mergeFormDefaults } from "../../../../utils/mergeFormDefaults";

interface InventoryStockFormProps {
  defaultValues?: Partial<InventoryStockFormInput>;
  onSubmit: (data: InventoryStockFormInput) => Promise<void>;
  loading?: boolean;
}

const STATUS_OPTIONS = ["Active", "Inactive"] as const;

// service_type value -> matching entity-reference field + dropdown to search it in.
// Hotel/Airline/Ziyarat keep their own operational masters; every other service
// type (Transport/Visa/Insurance/Guide/Meal/Laundry/Other) is just a Vendor.
const SERVICE_REFERENCE_MAP: Record<string, { field: keyof InventoryStockFormInput; dropdownName: string }> = {
  Hotel: { field: "hotel_uuid", dropdownName: "hotels" },
  Airline: { field: "airline_uuid", dropdownName: "airlines" },
  Ziyarat: { field: "ziyarat_uuid", dropdownName: "ziyarats" },
  Transport: { field: "vendor_uuid", dropdownName: "vendors" },
  Visa: { field: "vendor_uuid", dropdownName: "vendors" },
  Insurance: { field: "vendor_uuid", dropdownName: "vendors" },
  Guide: { field: "vendor_uuid", dropdownName: "vendors" },
  Meal: { field: "vendor_uuid", dropdownName: "vendors" },
  Laundry: { field: "vendor_uuid", dropdownName: "vendors" },
  Other: { field: "vendor_uuid", dropdownName: "vendors" },
};

const emptyValues: InventoryStockFormInput = {
  contract_uuid: "",
  inventory_code: "",
  inventory_name: "",
  service_type: "",
  hotel_uuid: "",
  airline_uuid: "",
  ziyarat_uuid: "",
  vendor_uuid: "",
  start_date: "",
  end_date: "",
  total_qty: 0,
  booked_qty: 0,
  blocked_qty: 0,
  cost_price: undefined,
  selling_price: undefined,
  currency_code: "",
  remarks: "",
  status: "Active",
  is_active: true,
};

export default function InventoryStockForm({
  defaultValues,
  onSubmit,
  loading = false,
}: InventoryStockFormProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const inventoryStockSchema = useMemo(() => getInventoryStockSchema(t), [t]);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<InventoryStockFormInput>({
    resolver: zodResolver(inventoryStockSchema),
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  useEffect(() => {
    if (defaultValues) {
      reset(mergeFormDefaults(emptyValues, defaultValues));
    }
  }, [defaultValues, reset]);

  const serviceType = watch("service_type");
  const activeReference = serviceType ? SERVICE_REFERENCE_MAP[serviceType] : undefined;

  // Selecting a different service type invalidates whichever reference was
  // picked for the previous one — clear all 6 so a stale id is never submitted.
  const handleServiceTypeChange = (value: string | null) => {
    setValue("service_type", value ?? "");
    Object.values(SERVICE_REFERENCE_MAP).forEach(({ field }) => setValue(field, ""));
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit, () =>
        showSnackbar({ message: t("validation.fixHighlightedFields"), severity: "error" }),
      )}
      noValidate
    >
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <EntityAutocomplete
              name="contract_uuid"
              label={t("inventoryStock.contract")}
              control={control}
              dropdownName="vendor_contracts"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="inventory_code"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("inventoryStock.code")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="service_type"
              control={control}
              render={({ field }) => (
                <DropdownAutocomplete
                  name="service_type"
                  dropdownName="inventory_service_type"
                  label={t("inventoryStock.serviceType")}
                  value={field.value ?? null}
                  onChange={handleServiceTypeChange}
                  useForm={false}
                  allowAdd={false}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Controller
              name="inventory_name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("inventoryStock.name")}
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          {activeReference && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <EntityAutocomplete
                key={activeReference.field}
                name={activeReference.field}
                label={`${t("inventoryStock.serviceReference")} (${serviceType})`}
                control={control}
                dropdownName={activeReference.dropdownName}
              />
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="start_date"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("inventoryStock.startDate")}
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="end_date"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("inventoryStock.endDate")}
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 2 }}>
            <Controller
              name="total_qty"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  label={t("inventoryStock.totalQty")}
                  type="number"
                  fullWidth
                  required
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 2 }}>
            <Controller
              name="booked_qty"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  label={t("inventoryStock.bookedQty")}
                  type="number"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 2 }}>
            <Controller
              name="blocked_qty"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  label={t("inventoryStock.blockedQty")}
                  type="number"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="cost_price"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  label={t("inventoryStock.costPrice")}
                  type="number"
                  fullWidth
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 3 }}>
            <Controller
              name="selling_price"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                  label={t("inventoryStock.sellingPrice")}
                  type="number"
                  fullWidth
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 2 }}>
            <Controller
              name="currency_code"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={t("vendorContract.currency")}
                  fullWidth
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  slotProps={{ htmlInput: { maxLength: 3 } }}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 2 }}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <TextField {...field} select label={t("vendorContract.status")} fullWidth>
                  {STATUS_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt === "Active" ? t("common.active") : t("common.inactive")}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 2 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t("common.active")}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Controller
              name="remarks"
              control={control}
              render={({ field }) => (
                <TextField {...field} label={t("vendorContract.remarks")} fullWidth multiline rows={2} />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Box display="flex" justifyContent="space-between">
        <Button variant="outlined" onClick={() => navigate("/app/inventory/stock")}>
          {t("common.back")}
        </Button>

        <Box display="flex" gap={2}>
          <Button variant="outlined" color="error" onClick={() => reset()} size="large">
            {t("common.discard")}
          </Button>

          <Button type="submit" variant="contained" size="large" disabled={isSubmitting || loading}>
            {isSubmitting || loading ? t("common.saving") : t("common.save")}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
