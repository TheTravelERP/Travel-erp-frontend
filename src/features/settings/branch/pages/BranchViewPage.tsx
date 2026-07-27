// src/features/settings/branch/pages/BranchViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import { Navigate, useNavigate, useParams } from "react-router-dom";

import { getBranchByUuid } from "../branch.api";
import { useSnackbar } from "../../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../../hooks/usePermission";
import FormPageLayout from "../../../../components/forms/FormPageLayout";

import type { BranchDetail } from "../branch.types";

export default function BranchViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission("settings.branch_master");

  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState<BranchDetail | null>(null);

  useEffect(() => {
    if (uuid) {
      loadBranch();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadBranch() {
    try {
      const data = await getBranchByUuid(uuid!, isTrash);
      setBranch(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/settings/branch-master");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!branch) {
    return null;
  }

  return (
    <FormPageLayout
      title={t("common.view")}
      breadcrumbs={[
        { label: t("menu.dashboard"), href: "/app/dashboard" },
        { label: t("menu.settings.branch_master"), href: "/app/settings/branch-master" },
        { label: t("common.view") },
      ]}
    >
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Typography variant="h6" color="primary">
              {t("branch.title")}
            </Typography>
            {branch.is_head_office && (
              <Chip size="small" color="primary" label={t("branch.headOffice")} />
            )}
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.code")}</Typography>
              <Typography mt={0.5}>{branch.branch_code}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.name")}</Typography>
              <Typography mt={0.5}>{branch.branch_name}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.legalName")}</Typography>
              <Typography mt={0.5}>{branch.legal_name || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.currency")}</Typography>
              <Typography mt={0.5}>{branch.currency_code}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("common.status")}</Typography>
              <Typography mt={0.5}>
                <Chip
                  size="small"
                  label={branch.is_active ? t("common.active") : t("common.inactive")}
                  color={branch.is_active ? "success" : "default"}
                />
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("branch.sectionContact")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.contactPerson")}</Typography>
              <Typography mt={0.5}>{branch.contact_person_name || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.manager")}</Typography>
              <Typography mt={0.5}>
                {branch.manager_name
                  ? `${branch.manager_name}${branch.manager_email ? ` (${branch.manager_email})` : ""}`
                  : "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.officePhone")}</Typography>
              <Typography mt={0.5}>{branch.office_phone || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.emergencyPhone")}</Typography>
              <Typography mt={0.5}>{branch.emergency_phone || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.whatsappNumber")}</Typography>
              <Typography mt={0.5}>{branch.whatsapp_number || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.email")}</Typography>
              <Typography mt={0.5}>{branch.email || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.website")}</Typography>
              <Typography mt={0.5}>{branch.website || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("common.address")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("common.address")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {[branch.address_line1, branch.address_line2].filter(Boolean).join(", ") || "-"}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.city")}</Typography>
              <Typography mt={0.5}>{branch.city || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.state")}</Typography>
              <Typography mt={0.5}>{branch.state || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.country")}</Typography>
              <Typography mt={0.5}>{branch.country || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.postalCode")}</Typography>
              <Typography mt={0.5}>{branch.postal_code || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.latitude")}</Typography>
              <Typography mt={0.5}>{branch.latitude ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.longitude")}</Typography>
              <Typography mt={0.5}>{branch.longitude ?? "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.workingFrom")}</Typography>
              <Typography mt={0.5}>{branch.working_from || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.workingTo")}</Typography>
              <Typography mt={0.5}>{branch.working_to || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("branch.timezone")}</Typography>
              <Typography mt={0.5}>{branch.timezone || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("branch.sectionOther")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("branch.remarks")}</Typography>
              <Typography mt={0.5} whiteSpace="pre-wrap">
                {branch.remarks || "-"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate("/app/settings/branch-master")}
            size="large"
          >
            {t("common.back")}
          </Button>

          <Box display="flex" gap={2}>
            {perms.can_edit && !isTrash && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/app/settings/branch-master/${uuid}/edit`)}
              >
                {t("common.edit")}
              </Button>
            )}
          </Box>
        </Box>
    </FormPageLayout>
  );
}
