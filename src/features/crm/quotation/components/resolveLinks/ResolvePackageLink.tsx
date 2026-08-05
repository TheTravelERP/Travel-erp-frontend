// src/features/crm/quotation/components/resolveLinks/ResolvePackageLink.tsx
import { useRef, useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";

import EntityAutocomplete from "../../../../../components/common/EntityAutocomplete";
import ResolveLinkShell from "./ResolveLinkShell";
import { useSnackbar } from "../../../../../components/ui/SnackbarProvider";
import { getErrorMessage } from "../../../../../utils/errorMessage";
import { createPackage } from "../../../../package/package.api";
import { linkExistingPackageForEnquiry } from "../../../../enquiry/enquiry.api";
import type { EnquiryDetail } from "../../../../enquiry/enquiry.types";
import CreatePackageTypeDialog from "../../../../package/components/CreatePackageTypeDialog";
import PackageQuickCreateFields, {
  getPackageQuickCreateSchema,
  suggestPackageCode,
  type PackageQuickCreateValues,
} from "../../../../package/components/PackageQuickCreateFields";

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
  const [packageTypeDialogOpen, setPackageTypeDialogOpen] = useState(false);
  const codeManuallyEdited = useRef(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PackageQuickCreateValues>({
    resolver: zodResolver(getPackageQuickCreateSchema(t)),
    defaultValues: {
      name: enquiry.package_name || "",
      code: suggestPackageCode(enquiry.package_name || ""),
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

  async function handleCreateNew(values: PackageQuickCreateValues) {
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
          <PackageQuickCreateFields
            control={control}
            setValue={setValue}
            errors={errors}
            onPackageTypeAddNew={() => setPackageTypeDialogOpen(true)}
            codeManuallyEditedRef={codeManuallyEdited}
          />

          <Box display="flex" justifyContent="flex-end" mt={1.5}>
            <Button
              type="button"
              size="small"
              variant="contained"
              disabled={creating}
              onClick={handleSubmit(handleCreateNew)}
            >
              {creating ? t("common.saving") : t("common.save")}
            </Button>
          </Box>

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
