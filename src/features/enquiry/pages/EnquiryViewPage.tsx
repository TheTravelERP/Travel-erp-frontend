// src/features/enquiry/pages/EnquiryViewPage.tsx

import { useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Link,
  Paper,
  Typography,
  Grid,
  Chip,
  Button,
} from "@mui/material";

import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";

import { getEnquiryById } from "../enquiry.api";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";
import { usePermission } from "../../../hooks/usePermission";

import type { EnquiryFormInput } from "../enquiry.types";

export default function EnquiryViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();
  const perms = usePermission("enquiries");

  const [loading, setLoading] = useState(true);
  const [enquiry, setEnquiry] = useState<EnquiryFormInput | null>(null);

  useEffect(() => {
    if (!id) return;

    loadEnquiry();
  }, [id]);

  async function loadEnquiry() {
    try {
      setLoading(true);

      const data = await getEnquiryById(Number(id));

      setEnquiry(data);
    } catch (err: any) {
      showSnackbar({
        message:
          err?.response?.data?.detail ||
          err?.message ||
          "Unable to load enquiry",
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
    <Box sx={{ p: 1 }}>
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
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption">Customer</Typography>

            <Typography>{enquiry.customer_name || "-"}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption">Mobile</Typography>

            <Typography>{enquiry.customer_mobile || "-"}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption">Email</Typography>

            <Typography>{enquiry.customer_email || "-"}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption">Package</Typography>

            <Typography>{enquiry.package_name || "-"}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption">PAX</Typography>

            <Typography>{enquiry.pax_count}</Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption">Lead Source</Typography>

            <Typography>{enquiry.lead_source}</Typography>
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
            <Typography variant="caption">Description</Typography>

            <Typography whiteSpace="pre-wrap">
              {enquiry.description || "-"}
            </Typography>
          </Grid>
        </Grid>

        <Box mt={4} display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={() => navigate("/app/enquiries")}>
            Back
          </Button>

          {perms.can_edit && (
            <Button
              variant="contained"
              onClick={() => navigate(`/app/enquiries/${id}/edit`)}
            >
              Edit
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
