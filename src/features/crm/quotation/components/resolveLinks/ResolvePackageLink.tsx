// src/features/crm/quotation/components/resolveLinks/ResolvePackageLink.tsx
import { useRef, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Link, Stack, TextField } from "@mui/material";
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
import { createPackageType } from "../../../../package/packageType/packageType.api";
import { linkExistingPackageForEnquiry } from "../../../../enquiry/enquiry.api";
import type { EnquiryDetail } from "../../../../enquiry/enquiry.types";

// This Quick Create form has a deliberately narrow boundary: it may only
// ever produce a bare Package row (name/type/duration/currency). It must
// never touch PackageService, PackageDetail, inclusions/exclusions, or
// supplier mapping — a package created here has zero PackageService rows by
// design, which is exactly what routes a quotation built against it onto
// the Flat Package Pricing fallback (Occupancy Group UI) instead of the
// normal service-lines table. Do not add a "quick add a service too"
// convenience here; that boundary is intentional.
const getInlinePackageSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().trim().min(1, t("validation.nameRequired")),
    code: z.string().trim().min(1, t("validation.codeRequired")),
    package_type_uuid: z.string().nullable().optional(),
    duration_days: z.coerce.number().int().min(0).optional(),
    duration_nights: z.coerce.number().int().min(0).optional(),
    currency_code: z.string().trim().length(3, t("quotation.validation.currencyCode3")),
  });

type InlinePackageValues = z.infer<ReturnType<typeof getInlinePackageSchema>>;

const getInlinePackageTypeSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().trim().min(1, t("packageType.validation.nameRequired")),
    code: z.string().trim().min(1, t("packageType.validation.codeRequired")),
    category: z.string().trim().min(1, t("packageType.validation.categoryRequired")),
  });

type InlinePackageTypeValues = z.infer<ReturnType<typeof getInlinePackageTypeSchema>>;

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

function CreatePackageTypeDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (option: { label: string; value: string }) => void;
}) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [saving, setSaving] = useState(false);
  const schema = getInlinePackageTypeSchema(t);
  const codeManuallyEdited = useRef(false);

  const { control, handleSubmit, setValue, reset } = useForm<InlinePackageTypeValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", code: "", category: "General" },
  });

  async function handleCreate(values: InlinePackageTypeValues) {
    setSaving(true);
    try {
      const created = await createPackageType(values);
      onCreated({ label: created.name, value: created.uuid });
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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("common.add")} {t("package.packageType")}</DialogTitle>
      <DialogContent>
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12 }}>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("packageType.name")}
                  size="small"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  onChange={(e) => {
                    field.onChange(e);
                    if (!codeManuallyEdited.current) setValue("code", suggestCode(e.target.value));
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Controller
              name="code"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("packageType.code")}
                  size="small"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  onChange={(e) => {
                    codeManuallyEdited.current = true;
                    field.onChange(e);
                  }}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Controller
              name="category"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label={t("packageType.category")}
                  size="small"
                  fullWidth
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>{t("common.cancel")}</Button>
        <Button variant="contained" disabled={saving} onClick={handleSubmit(handleCreate)}>
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ResolvePackageLink({ enquiry, onResolved, disabled }: ResolvePackageLinkProps) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();

  const [selectedPkgUuid, setSelectedPkgUuid] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [codeVisible, setCodeVisible] = useState(false);
  const [packageTypeDialogOpen, setPackageTypeDialogOpen] = useState(false);
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
      package_type_uuid: null,
      duration_days: undefined,
      duration_nights: undefined,
      currency_code: "",
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
      // Bare Package only — no PackageService/PackageDetail/pricing is
      // created here (see the boundary comment above the schema). A
      // quotation built against this package resolves via the Flat Package
      // Pricing fallback (Occupancy Group UI) rather than copied service lines.
      const pkg = await createPackage({
        name: values.name,
        code: values.code,
        package_type_uuid: values.package_type_uuid || undefined,
        duration_days: values.duration_days,
        duration_nights: values.duration_nights,
        currency_code: values.currency_code,
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

            {codeVisible ? (
              <Grid size={{ xs: 12 }}>
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
            ) : (
              <Grid size={{ xs: 12 }}>
                <Link component="button" type="button" variant="caption" onClick={() => setCodeVisible(true)}>
                  {t("common.edit")} {t("common.code")}
                </Link>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <EntityAutocomplete
                name="package_type_uuid"
                label={t("package.packageType")}
                control={control}
                dropdownName="package_types"
                allowAdd
                onAddNew={() => setPackageTypeDialogOpen(true)}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Controller
                name="duration_days"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label={t("package.durationDays")}
                    size="small"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Controller
                name="duration_nights"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label={t("package.durationNights")}
                    size="small"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Controller
                name="currency_code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t("quotation.currencyCode")}
                    size="small"
                    fullWidth
                    required
                    error={!!errors.currency_code}
                    helperText={errors.currency_code?.message}
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

          <CreatePackageTypeDialog
            open={packageTypeDialogOpen}
            onClose={() => setPackageTypeDialogOpen(false)}
            onCreated={(option) => setValue("package_type_uuid", option.value, { shouldValidate: true })}
          />
        </Box>
      }
    />
  );
}
