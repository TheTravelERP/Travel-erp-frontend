// src/auth/pages/RegisterPage.tsx
import React from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Stack,
  Divider,
  Alert,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { registerOrgSchema, type RegisterOrgInput } from "../../utils/validator";
import { registerOrgApi } from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../components/ui/SnackbarProvider";

const Root = styled("div")(({ theme }) => ({
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  backgroundColor: theme.palette.background.default,
  padding: theme.spacing(2),
}));

const Card = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: "100%",
  maxWidth: 480,
  borderRadius: theme.shape.borderRadius * 1.5,
}));

export default function RegisterPage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterOrgInput>({
    resolver: zodResolver(registerOrgSchema),
    defaultValues: {
      organization_name: "",
      country_code: "",
      admin_name: "",
      email: "",
      mobile: "",
      password: "",
    },
  });

  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  async function onSubmit(data: RegisterOrgInput) {
    setGlobalError(null);
    try {
      const res = await registerOrgApi(data);
      // If backend returns message + code, use it; otherwise show generic
      const msg = res?.message || "Organization created — please login.";
      showSnackbar({ message: msg, severity: "success" });
      setSuccessMessage(msg);
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (err: any) {
      // extract meaningful message from axios error
      const detail = err?.response?.data;
      // common shapes:
      // { detail: "..." } or { message: "..."} or { errors: { field: "msg" } }
      const messageFromApi =
        detail?.detail || detail?.message || (typeof detail === "string" ? detail : null);

      if (messageFromApi) {
        showSnackbar({ message: String(messageFromApi), severity: "error" });
        setGlobalError(String(messageFromApi));
      } else {
        // fallbacks
        const fallback = err?.message || "Failed to register organization.";
        showSnackbar({ message: fallback, severity: "error" });
        setGlobalError(fallback);
      }

      // If backend returns per-field errors (object), set form errors via setError already implemented in your form flow
      if (detail && typeof detail === "object" && !messageFromApi) {
        // example: { email: "already exists" }
        Object.entries(detail).forEach(([k, v]) => {
          setError(k as any, { type: "server", message: String(v) });
        });
      }
    }
  }

  return (
    <Root>
      <Card elevation={6}>
        <Stack spacing={2} alignItems="center" mb={1}>
          <Typography variant="h4" color="primary.main" fontWeight={700}>
            Travel ERP
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Create your organization
          </Typography>
        </Stack>

        {globalError && <Alert severity="error">{globalError}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} mt={1} noValidate>
          <Stack spacing={2}>
            <Controller
              name="organization_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Organization Name"
                  fullWidth
                  required
                  error={!!errors.organization_name}
                  helperText={errors.organization_name?.message ?? ""}
                />
              )}
            />

            <Controller
              name="country_code"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Country"
                  fullWidth
                  required
                  error={!!errors.country_code}
                  helperText={errors.country_code?.message ?? ""}
                >
                  <MenuItem value="IN">India</MenuItem>
                  <MenuItem value="SA">Saudi Arabia</MenuItem>
                  <MenuItem value="AE">United Arab Emirates</MenuItem>
                  <MenuItem value="BD">Bangladesh</MenuItem>
                  <MenuItem value="PK">Pakistan</MenuItem>
                </TextField>
              )}
            />


            <Controller
              name="admin_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Admin Full Name"
                  fullWidth
                  required
                  error={!!errors.admin_name}
                  helperText={errors.admin_name?.message ?? ""}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  error={!!errors.email}
                  helperText={errors.email?.message ?? ""}
                />
              )}
            />

            <Controller
              name="mobile"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Mobile Number"
                  fullWidth
                  error={!!errors.mobile}
                  helperText={errors.mobile?.message ?? ""}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Password"
                  type="password"
                  fullWidth
                  required
                  error={!!errors.password}
                  helperText={errors.password?.message ?? "Min 8 characters"}
                />
              )}
            />

            <Button type="submit" variant="contained" fullWidth size="large" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Register Organization"}
            </Button>

            <Divider />

            <Button variant="text" fullWidth onClick={() => navigate("/login")}>
              Already have an account? Sign In
            </Button>
          </Stack>
        </Box>
      </Card>
    </Root>
  );
}
