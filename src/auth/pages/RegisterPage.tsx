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
  Autocomplete,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { registerOrgSchema, type RegisterOrgInput } from "../../utils/validator";
import { registerOrgApi } from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../components/ui/SnackbarProvider";
import { Visibility, VisibilityOff } from "@mui/icons-material";

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

  const countries = [
    { code: 'IN', label: 'India', phone: '91' },
    { code: 'SA', label: 'Saudi Arabia', phone: '966' },
    { code: 'AE', label: 'United Arab Emirates', phone: '971' },
    { code: 'BD', label: 'Bangladesh', phone: '880' },
    { code: 'PK', label: 'Pakistan', phone: '92' },
  ];

  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevents focus loss when clicking the icon
  };

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
              render={({ field: { onChange, value, ...field } }) => (
                <Autocomplete
                  {...field}
                  options={countries}
                  autoHighlight
                  // Ensure the value matches the country object based on the code
                  value={countries.find((c) => c.code === value) || null}
                  onChange={(_, newValue) => {
                    onChange(newValue ? newValue.code : "");
                  }}
                  getOptionLabel={(option) => option.label}
                  renderOption={(props, option) => (
                    <Box 
                      component="li" 
                      sx={{ '& > img': { mr: 2, flexShrink: 0 }, fontSize: '0.9rem' }} 
                      {...props}
                    >
                      <img
                        loading="lazy"
                        width="20"
                        src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                        srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                        alt=""
                      />
                      {option.label} ({option.code}) +{option.phone}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Country"
                      required
                      error={!!errors.country_code}
                      helperText={errors.country_code?.message ?? ""}
                      inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password', // disable autocomplete and autofill
                      }}
                    />
                  )}
                />
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
                  // Dynamically change type between 'password' and 'text'
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  required
                  error={!!errors.password}
                  helperText={errors.password?.message ?? "Min 8 characters"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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
