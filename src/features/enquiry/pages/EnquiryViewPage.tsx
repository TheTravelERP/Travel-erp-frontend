// src/features/enquiry/pages/EnquiryViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Button,
  Divider,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";

import {
  Link as RouterLink,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import { getEnquiryByUuid } from "../enquiry.api";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../hooks/usePermission";
import DropdownColorChip from "../../../components/common/DropdownColorChip";

import type { EnquiryFormInput } from "../enquiry.types";

export default function EnquiryViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const perms = usePermission('crm.enquiries');

  const [loading, setLoading] = useState(true);
  const [enquiry, setEnquiry] = useState<EnquiryFormInput | null>(null);

  useEffect(() => {
    if (uuid) {
      loadEnquiry();
    }
  }, [uuid]);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  async function loadEnquiry() {
    try {
      const data = await getEnquiryByUuid(uuid!, isTrash);

      setEnquiry(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("common.loadUnable"),
        severity: "error",
      });

      navigate("/app/enquiries");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>{t("common.loading")}</Typography>;
  }

  if (!enquiry) {
    return null;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      {/* Header */}

      <Typography variant="h6" fontWeight={700}>
        {t("common.view")}
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" to="/app/dashboard">
          {t("menu.dashboard")}
        </Link>

        <Link component={RouterLink} underline="hover" to="/app/enquiries">
          {t('menu.crm.enquiries')}
        </Link>

        <Typography>{t("common.view")}</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        {/* ================= CUSTOMER ================= */}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("enquiry.customerInformation")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("common.customerName")}</Typography>

              <Typography mt={0.5}>{enquiry.customer_name || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("common.mobile")}</Typography>

              <Typography mt={0.5}>{enquiry.customer_mobile || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">{t("common.email")}</Typography>

              <Typography mt={0.5}>{enquiry.customer_email || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= PACKAGE ================= */}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("enquiry.packageSelection")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("enquiry.packageName")}</Typography>

              <Typography mt={0.5}>{enquiry.package_name || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= ENQUIRY ================= */}

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            {t("enquiry.enquiryDetails")}
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("enquiry.paxCount")}</Typography>

              <Typography mt={0.5}>{enquiry.pax_count}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("common.source")}</Typography>

              <Typography mt={0.5}>{enquiry.lead_source}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("common.priority")}</Typography>

              <Box mt={0.5}>
                <DropdownColorChip
                  dropdownName="enquiry_priority"
                  value={enquiry.enquiry_priority}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">{t("common.status")}</Typography>

              <Box mt={0.5}>
                <DropdownColorChip
                  dropdownName="enquiry_status"
                  value={enquiry.conversion_status}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">{t("common.notes")}</Typography>

              <Typography mt={0.5} whiteSpace="pre-wrap">
                {enquiry.description || "-"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= FOOTER ================= */}

        <Divider sx={{ my: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          {/* Left */}

          <Button
            variant="outlined"
            onClick={() => navigate("/app/enquiries")}
            size="large"
          >
            {t("common.back")}
          </Button>

          {/* Right */}

          <Box display="flex" gap={2}>
            {perms.can_edit && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/app/enquiries/${uuid}/edit`)}
              >
                {t("common.edit")}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
