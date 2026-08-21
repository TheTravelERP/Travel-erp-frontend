// src/features/inventory/vendor/pages/VendorViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Button, Chip, Divider, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getVendorByUuid } from "../vendor.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";
import FormPageLayout from "../../../../components/forms/FormPageLayout";
import VendorDocumentsPanel from "../components/VendorDocumentsPanel";

import type { VendorDetail } from "../vendor.types";

export default function VendorViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("inventory.vendor_master");

  const [loading, setLoading] = useState(true);
  const [vendor, setVendor] = useState<VendorDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadVendor();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadVendor() {
    try {
      const data = await getVendorByUuid(uuid!, isTrash);
      setVendor(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/inventory/vendor-master");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!vendor) {
    return null;
  }

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.inventory.vendor_master"), href: "/app/inventory/vendor-master" },
        { label: t("common.view") },
      ]}
    >
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("vendor.sectionBasic")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendor.code")}</Typography>
              <Typography mt={0.5}>{vendor.vendor_code}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendor.name")}</Typography>
              <Typography mt={0.5}>{vendor.vendor_name}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendor.status")}</Typography>
              <Box mt={0.5}>
                <Chip
                  size="small"
                  label={vendor.status || t("common.active")}
                  color={
                    vendor.status === "Active" || !vendor.status
                      ? "success"
                      : vendor.status === "Blacklisted"
                        ? "error"
                        : "default"
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("vendor.sectionContact")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendor.contactPerson")}</Typography>
              <Typography mt={0.5}>{vendor.contact_person || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendor.mobile")}</Typography>
              <Typography mt={0.5}>{vendor.mobile || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendor.email")}</Typography>
              <Typography mt={0.5}>{vendor.email || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendor.website")}</Typography>
              <Typography mt={0.5}>{vendor.website || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("vendor.sectionPhysicalAddress")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("vendor.address")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {vendor.physical_address || "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("common.country")}</Typography>
              <Typography mt={0.5}>{vendor.physical_country_name || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("location.stateProvince")}</Typography>
              <Typography mt={0.5}>{vendor.physical_state_province_name || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("vendor.city")}</Typography>
              <Typography mt={0.5}>{vendor.physical_city || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("vendor.pincode")}</Typography>
              <Typography mt={0.5}>{vendor.physical_pincode || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("vendor.sectionMailingAddress")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("vendor.address")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {vendor.mailing_address || "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("common.country")}</Typography>
              <Typography mt={0.5}>{vendor.mailing_country_name || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("location.stateProvince")}</Typography>
              <Typography mt={0.5}>{vendor.mailing_state_province_name || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("vendor.city")}</Typography>
              <Typography mt={0.5}>{vendor.mailing_city || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("vendor.pincode")}</Typography>
              <Typography mt={0.5}>{vendor.mailing_pincode || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("vendor.sectionTax")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t("vendor.gstin")}</Typography>
              <Typography mt={0.5}>{vendor.gstin || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t("vendor.pan")}</Typography>
              <Typography mt={0.5}>{vendor.pan || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("vendor.sectionBanking")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendor.bankName")}</Typography>
              <Typography mt={0.5}>{vendor.bank_name || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendor.bankBranch")}</Typography>
              <Typography mt={0.5}>{vendor.bank_branch || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendor.accountHolderName")}</Typography>
              <Typography mt={0.5}>{vendor.account_holder_name || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendor.accountNumber")}</Typography>
              <Typography mt={0.5}>{vendor.account_number || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendor.accountType")}</Typography>
              <Typography mt={0.5}>{vendor.account_type || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendor.ifscCode")}</Typography>
              <Typography mt={0.5}>{vendor.ifsc_code || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("vendor.swiftCode")}</Typography>
              <Typography mt={0.5}>{vendor.swift_code || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("vendor.sectionContacts")}
          </Typography>

          {(vendor.contacts ?? []).length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t("vendor.noContactsYet")}
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {vendor.contacts.map((contact, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={contact.uuid ?? index}>
                  <Paper variant="outlined" sx={{ p: 1.5 }}>
                    <Typography variant="subtitle2">{contact.contact_name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {contact.contact_type}
                    </Typography>
                    <Typography variant="body2" mt={0.5}>
                      {contact.phone || "-"} &bull; {contact.email || "-"}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("vendor.sectionAdditional")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption">{t("vendor.defaultCurrency")}</Typography>
              <Typography mt={0.5}>{vendor.default_currency_name || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("vendor.paymentTermsDefault")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {vendor.payment_terms || "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("vendor.remarks")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {vendor.remarks || "-"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
            {t("common.attachments")}
          </Typography>

          <VendorDocumentsPanel
            vendorUuid={vendor.uuid}
            canEdit={perms.can_edit && !isTrash}
          />
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate("/app/inventory/vendor-master")}
            size="large"
          >
            {t("common.back")}
          </Button>

          <Box display="flex" gap={2}>
            {perms.can_edit && !isTrash && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/app/inventory/vendor-master/${uuid}/edit`)}
              >
                {t("common.edit")}
              </Button>
            )}
          </Box>
        </Box>
    </FormPageLayout>
  );
}
