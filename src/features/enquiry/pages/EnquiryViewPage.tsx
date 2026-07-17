// src/features/enquiry/pages/EnquiryViewPage.tsx

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import {
  Link as RouterLink,
  Navigate,
  useNavigate,
  useParams,
} from "react-router-dom";

import { getEnquiryByUuid } from "../enquiry.api";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../hooks/usePermission";

import type { EnquiryFormInput } from "../enquiry.types";

export default function EnquiryViewPage() {
  const { uuid } = useParams();
  const [searchParams] = useSearchParams();
  const isTrash = searchParams.get("is_deleted") === "true";

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();

  const perms = usePermission("enquiries");

  const [loading, setLoading] = useState(true);
  const [enquiry, setEnquiry] = useState<EnquiryFormInput | null>(null);

  if (!perms.can_view) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  useEffect(() => {
    if (uuid) {
      loadEnquiry();
    }
  }, [uuid]);

  async function loadEnquiry() {
    try {
      const data = await getEnquiryByUuid(uuid!, isTrash);

      setEnquiry(data);
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || "Unable to load enquiry",
        severity: "error",
      });

      navigate("/app/enquiries");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!enquiry) {
    return null;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      {/* Header */}

      <Typography variant="h6" fontWeight={700}>
        View Enquiry
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link component={RouterLink} underline="hover" to="/app/dashboard">
          Dashboard
        </Link>

        <Link component={RouterLink} underline="hover" to="/app/enquiries">
          Enquiries
        </Link>

        <Typography>View</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        {/* ================= CUSTOMER ================= */}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            Customer Information
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">Customer Name</Typography>

              <Typography mt={0.5}>{enquiry.customer_name || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">Mobile Number</Typography>

              <Typography mt={0.5}>{enquiry.customer_mobile || "-"}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="caption">Email</Typography>

              <Typography mt={0.5}>{enquiry.customer_email || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= PACKAGE ================= */}

        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            Package Selection
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">Package Name</Typography>

              <Typography mt={0.5}>{enquiry.package_name || "-"}</Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* ================= ENQUIRY ================= */}

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
            Enquiry Details
          </Typography>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">PAX Count</Typography>

              <Typography mt={0.5}>{enquiry.pax_count}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">Source</Typography>

              <Typography mt={0.5}>{enquiry.lead_source}</Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">Priority</Typography>

              <Box mt={0.5}>
                <Chip
                  label={enquiry.enquiry_priority}
                  color="warning"
                  size="small"
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="caption">Status</Typography>

              <Box mt={0.5}>
                <Chip
                  label={enquiry.conversion_status}
                  color="info"
                  size="small"
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="caption">Notes</Typography>

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
            Back
          </Button>

          {/* Right */}

          <Box display="flex" gap={2}>
            {perms.can_edit && (
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate(`/app/enquiries/${uuid}/edit`)}
              >
                Edit
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
