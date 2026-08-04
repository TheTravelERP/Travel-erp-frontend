// src/features/crm/quotation/components/QuotationOccupancyGroups.tsx
import { Box, Button, Chip, Grid, IconButton, Stack, TextField, Typography } from "@mui/material";
import { Controller, useFieldArray, useWatch, type Control } from "react-hook-form";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import DropdownAutocomplete from "../../../../components/common/DropdownAutocomplete";
import FormSection from "../../../../components/forms/FormSection";
import { resolvePackagePricing } from "../../../package/packagePricing/packagePricing.api";
import type { PackagePricingResolveResult } from "../../../package/packagePricing/packagePricing.types";
import type { QuotationFormInput } from "../quotation.types";
import CreatePackagePricingDialog from "./CreatePackagePricingDialog";

const PASSENGER_FIELDS = [
  { field: "adult_count" as const, passengerType: "Adult" },
  { field: "child_count" as const, passengerType: "Child" },
  { field: "infant_count" as const, passengerType: "Infant" },
];

const emptyGroup = { occupancy_type: "", adult_count: 0, child_count: 0, infant_count: 0, discount_percent: 0 };

interface QuotationOccupancyGroupsProps {
  control: Control<QuotationFormInput>;
  packageUuid: string;
  packageCurrency: string;
  priceAsOfDate: string;
  disabled?: boolean;
  errorMessage?: string;
}

type ResolutionKey = `${number}:${string}`;
type ResolutionState = PackagePricingResolveResult | "loading";

export default function QuotationOccupancyGroups({
  control,
  packageUuid,
  packageCurrency,
  priceAsOfDate,
  disabled,
  errorMessage,
}: QuotationOccupancyGroupsProps) {
  const { t } = useTranslation();
  const { fields, append, remove } = useFieldArray({ control, name: "occupancy_groups" });
  const groups = useWatch({ control, name: "occupancy_groups" }) ?? [];

  const [resolutions, setResolutions] = useState<Record<ResolutionKey, ResolutionState>>({});
  const [dialogTarget, setDialogTarget] = useState<{ index: number; occupancyType: string; passengerType: string } | null>(null);

  async function resolveOne(index: number, occupancyType: string, passengerType: string) {
    if (!occupancyType || !packageUuid) return;
    const key: ResolutionKey = `${index}:${passengerType}`;
    setResolutions((prev) => ({ ...prev, [key]: "loading" }));
    try {
      const result = await resolvePackagePricing({
        package_uuid: packageUuid,
        occupancy_type: occupancyType,
        passenger_type: passengerType,
        price_as_of_date: priceAsOfDate,
      });
      setResolutions((prev) => ({ ...prev, [key]: result }));
    } catch {
      setResolutions((prev) => ({ ...prev, [key]: { resolved: false } }));
    }
  }

  function resolveGroup(index: number, occupancyType: string) {
    const group = groups[index];
    if (!group) return;
    PASSENGER_FIELDS.forEach(({ field, passengerType }) => {
      if ((group as any)[field] > 0) {
        void resolveOne(index, occupancyType, passengerType);
      }
    });
  }

  const total = Object.entries(resolutions).reduce((sum, [key, r]) => {
    if (r === "loading" || !r.resolved || r.price === undefined) return sum;
    const [indexStr, passengerType] = key.split(":");
    const countField = PASSENGER_FIELDS.find((p) => p.passengerType === passengerType)?.field;
    const count = countField ? ((groups[Number(indexStr)] as any)?.[countField] ?? 0) : 0;
    return sum + r.price * count;
  }, 0);

  return (
    <FormSection
      title={t("quotation.occupancyGroups")}
      titleAdornment={
        !disabled && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => append({ ...emptyGroup })}
            sx={{ ml: 2 }}
          >
            {t("quotation.addOccupancyGroup")}
          </Button>
        )
      }
    >
      <Grid size={{ xs: 12 }}>
        <Typography variant="body2" color="text.secondary">
          {t("quotation.noServiceLinesForPackage")}
        </Typography>
      </Grid>

      {errorMessage && (
        <Grid size={{ xs: 12 }}>
          <Typography color="error" variant="body2">{errorMessage}</Typography>
        </Grid>
      )}

      {fields.length === 0 && (
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary">{t("quotation.noOccupancyGroupsYet")}</Typography>
        </Grid>
      )}

      <Grid size={{ xs: 12 }}>
        <Stack spacing={2}>
          {fields.map((field, index) => (
            <Box key={field.id} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1.5 }}>
              <Grid container spacing={1.5} alignItems="center">
                <Grid size={{ xs: 12, sm: 2.8 }}>
                  <Controller
                    name={`occupancy_groups.${index}.occupancy_type`}
                    control={control}
                    render={({ field: f }) => (
                      <DropdownAutocomplete
                        name={`occupancy_groups.${index}.occupancy_type`}
                        label={t("packagePricing.occupancyType")}
                        dropdownName="occupancy_type"
                        useForm={false}
                        allowAdd={false}
                        disabled={disabled}
                        value={f.value}
                        onChange={(value: string) => {
                          f.onChange(value);
                          resolveGroup(index, value);
                        }}
                      />
                    )}
                  />
                </Grid>

                {PASSENGER_FIELDS.map(({ field: countField, passengerType }) => {
                  const key: ResolutionKey = `${index}:${passengerType}`;
                  const resolution = resolutions[key];
                  const occupancyType = groups[index]?.occupancy_type;
                  const count = (groups[index] as any)?.[countField] ?? 0;

                  return (
                    <Grid size={{ xs: 4, sm: 2.4 }} key={countField}>
                      <Controller
                        name={`occupancy_groups.${index}.${countField}`}
                        control={control}
                        render={({ field: f }) => (
                          <TextField
                            {...f}
                            type="number"
                            label={t(`quotation.${countField === "adult_count" ? "paxAdult" : countField === "child_count" ? "paxChild" : "paxInfant"}`)}
                            fullWidth
                            size="small"
                            disabled={disabled}
                            slotProps={{ htmlInput: { min: 0, max: 999 } }}
                            onBlur={(e) => {
                              f.onBlur();
                              if (Number(e.target.value) > 0 && occupancyType) {
                                void resolveOne(index, occupancyType, passengerType);
                              }
                            }}
                          />
                        )}
                      />
                      {count > 0 && occupancyType && (
                        <Box mt={0.5}>
                          {resolution === "loading" && (
                            <Chip size="small" label="…" />
                          )}
                          {resolution && resolution !== "loading" && resolution.resolved && (
                            <Chip
                              size="small"
                              color="success"
                              label={`${resolution.currency_code} ${resolution.price?.toLocaleString()}`}
                            />
                          )}
                          {resolution && resolution !== "loading" && !resolution.resolved && (
                            <Chip
                              size="small"
                              color="error"
                              label={t("quotation.pricingNotFound")}
                              onClick={() =>
                                setDialogTarget({ index, occupancyType, passengerType })
                              }
                            />
                          )}
                        </Box>
                      )}
                    </Grid>
                  );
                })}

                <Grid size={{ xs: 6, sm: 1.4 }}>
                  <Controller
                    name={`occupancy_groups.${index}.discount_percent`}
                    control={control}
                    render={({ field: f }) => (
                      <TextField
                        {...f}
                        type="number"
                        label={t("quotation.discountPercent")}
                        fullWidth
                        size="small"
                        disabled={disabled}
                        slotProps={{ htmlInput: { min: 0, max: 100 } }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 0.6 }}>
                  {!disabled && (
                    <IconButton color="error" onClick={() => remove(index)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            </Box>
          ))}
        </Stack>
      </Grid>

      {total > 0 && (
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle2">
            {t("quotation.resolvedPrice")}: {packageCurrency} {total.toLocaleString()}
          </Typography>
        </Grid>
      )}

      {dialogTarget && (
        <CreatePackagePricingDialog
          open
          onClose={() => setDialogTarget(null)}
          packageUuid={packageUuid}
          packageCurrency={packageCurrency}
          priceAsOfDate={priceAsOfDate}
          initialOccupancyType={dialogTarget.occupancyType}
          initialPassengerType={dialogTarget.passengerType}
          onResolved={(occupancyType, passengerType, result) => {
            setResolutions((prev) => ({ ...prev, [`${dialogTarget.index}:${passengerType}`]: result }));
          }}
        />
      )}
    </FormSection>
  );
}
