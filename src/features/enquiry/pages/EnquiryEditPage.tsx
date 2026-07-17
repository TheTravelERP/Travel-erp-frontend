// src/features/enquiry/pages/EnquiryEditPage.tsx

import { useEffect, useState } from "react";
import {
  Box,
  Breadcrumbs,
  Link,
  Paper,
  Typography,
} from "@mui/material";

import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";

import EnquiryForm from "../components/EnquiryForm";

import type { EnquiryFormInput } from "../enquiry.types";

import {
  getEnquiryByUuid,
  updateEnquiryByUuid,
} from "../enquiry.api";

import { usePermission } from "../../../hooks/usePermission";
import { useSnackbar } from "../../../components/ui/SnackbarProvider";

export default function EnquiryEditPage() {
  const { uuid } = useParams();

  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();

  const perms = usePermission("enquiries");

  const [loading, setLoading] = useState(true);

  const [defaultValues, setDefaultValues] =
    useState<EnquiryFormInput>();

  const [versionNo, setVersionNo] = useState<number>();

  if (!perms.can_edit) {
    return <Navigate to="/app/unauthorized" replace />;
  }

  useEffect(() => {
    loadEnquiry();
  }, []);

  async function loadEnquiry() {
    try {
      const data = await getEnquiryByUuid(uuid!)

      setDefaultValues(data);
      setVersionNo(data.version_no);
    } catch (err: any) {
      showSnackbar({
        message: "Failed to load enquiry",
        severity: "error",
      });

      navigate("/app/enquiries");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(data: EnquiryFormInput) {
    try {
      await updateEnquiryByUuid(uuid!, { ...data, version_no: versionNo! });

      showSnackbar({
        message: "Enquiry updated successfully",
        severity: "success",
      });

      navigate("/app/enquiries");
    } catch (err: any) {
      if (err?.response?.status === 409) {
        showSnackbar({
          message:
            err?.response?.data?.detail ??
            "This enquiry was updated by someone else. Please reload and try again.",
          severity: "error",
        });
        return;
      }

      showSnackbar({
        message:
          err?.response?.data?.detail ??
          "Failed to update enquiry",
        severity: "error",
      });
    }
  }

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: { xs: 1, md: 1 } }}>
      <Typography variant="h6" fontWeight={700}>
        Edit Enquiry
      </Typography>

      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component={RouterLink}
          to="/app/dashboard"
          underline="hover"
        >
          Dashboard
        </Link>

        <Link
          component={RouterLink}
          to="/app/enquiries"
          underline="hover"
        >
          Enquiries
        </Link>

        <Typography>Edit</Typography>
      </Breadcrumbs>

      <Paper sx={{ p: 3 }}>
        <EnquiryForm
          defaultValues={defaultValues}
          onSubmit={handleUpdate}
        />
      </Paper>
    </Box>
  );
}