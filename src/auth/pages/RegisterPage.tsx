// src/auth/pages/RegisterPage.tsx
import React, { useState } from "react";
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
import { getCountries } from "../../services/public.service";

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

  const [countries, setCountries] = React.useState<any[]>([]);
  const [countryLoading, setCountryLoading] = React.useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any | null>(null);
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<any | null>(null);


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
      confirm_password: "",
    },
  });

  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  async function onSubmit(data: RegisterOrgInput) {
    setGlobalError(null);
    try {
      // Create a shallow copy of the form data
      const payload = { ...data };

      // Append selected country phone code prefix to raw mobile sequence before delivery
      if (selectedPhoneCountry?.phone_code && payload.mobile) {
        // Strip out hyphens or spaces from complex codes (e.g., "1-684" -> "1684")
        const cleanPhoneCode = selectedPhoneCountry.phone_code.replace(/[^0-9]/g, "");
        payload.mobile = `+${cleanPhoneCode}${payload.mobile}`;
      }

      const res = await registerOrgApi(payload);
      const msg = res?.message || "Organization created — please login.";
      showSnackbar({ message: msg, severity: "success" });
      setSuccessMessage(msg);
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (err: any) {
      const detail = err?.response?.data;
      const messageFromApi =
        detail?.detail || detail?.message || (typeof detail === "string" ? detail : null);

      if (messageFromApi) {
        showSnackbar({ message: String(messageFromApi), severity: "error" });
        setGlobalError(String(messageFromApi));
      } else {
        const fallback = err?.message || "Failed to register organization.";
        showSnackbar({ message: fallback, severity: "error" });
        setGlobalError(fallback);
      }

      if (detail && typeof detail === "object" && !messageFromApi) {
        Object.entries(detail).forEach(([k, v]) => {
          setError(k as any, { type: "server", message: String(v) });
        });
      }
    }
  }

  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  React.useEffect(() => {
    loadCountries();
  }, []);

 const loadCountries = async () => {
  try {
    
    setCountryLoading(true);

    const res = await getCountries();

    const items = res.items || [];

    setCountries(items);

    const india =
      items.find(
        (x: any) => x.iso_code === "IN"
      ) || items[0];

    setSelectedCountry(india);
    setSelectedPhoneCountry(india);

  } catch (error) {
    console.error(error);
  } finally {
    setCountryLoading(false);
  }
};

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          maxWidth: 520,
          width: '100%',
        }}
      >
        {/* Header */}
        <Stack spacing={1.5} alignItems="center" mb={2}>
          <Typography variant="h5" color="primary">
            Travel ERP
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Create your organization
          </Typography>
        </Stack>

        {globalError && <Alert severity="error" sx={{ mb: 2 }}>{globalError}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} mt={1} noValidate>
          <Stack spacing={2}>
            <Controller
              name="organization_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Organization Name"
                  required
                  error={!!errors.organization_name}
                  helperText={errors.organization_name?.message ?? ''}
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
                  required
                  error={!!errors.admin_name}
                  helperText={errors.admin_name?.message ?? ''}
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
                  required
                  error={!!errors.email}
                  helperText={errors.email?.message ?? ''}
                />
              )}
            />

            {/* Profile Selection - Base Home Country */}
           <Controller
  name="country_code"
  control={control}
  render={({ field }) => (
    <Autocomplete
      options={countries}
      loading={countryLoading}
      value={selectedCountry}
      isOptionEqualToValue={(option, value) =>
        option.id === value?.id
      }
      getOptionLabel={(option) =>
        option?.label || ""
      }
      onChange={(_, value) => {
        setSelectedCountry(value);
        field.onChange(value?.iso_code || "");
      }}
      renderOption={(props, option) => {
  const { key, ...optionProps } = props;

  return (
    <Box
      key={key}
      component="li"
      {...optionProps}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <img
        src={option.flag_url}
        width={20}
        alt=""
      />

      {option.label} ({option.iso_code})
    </Box>
  );
}}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Select Profile Country"
          error={!!errors.country_code}
          helperText={
            errors.country_code?.message
          }
        />
      )}
    />
  )}
/>

            {/* Prefix Selection + Raw Local Mobile Block */}
            <Box display="flex" gap={1}>
  <Autocomplete
    sx={{
      width: 220,
      flexShrink: 0,
    }}
    options={countries}
    loading={countryLoading}
    value={selectedPhoneCountry}
    isOptionEqualToValue={(option, value) =>
      option.id === value?.id
    }
    getOptionLabel={(option) =>
      option
        ? `${option.label} (+${option.phone_code})`
        : ""
    }
    onChange={(_, value) => {
      setSelectedPhoneCountry(value);
    }}
    renderOption={(props, option) => {
  const { key, ...optionProps } = props;

  return (
    <Box
      key={key}
      component="li"
      {...optionProps}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <img
        src={option.flag_url}
        width={20}
        alt=""
      />

      {option.label} ({option.iso_code})
    </Box>
  );
}}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Code"
      />
    )}
  />

  <Controller
    name="mobile"
    control={control}
    render={({ field }) => (
      <TextField
        {...field}
        fullWidth
        label="Mobile Number"
        error={!!errors.mobile}
        helperText={errors.mobile?.message}
      />
    )}
  />
</Box>

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  error={!!errors.password}
                  helperText={errors.password?.message ?? ''}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
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

            <Controller
              name="confirm_password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  error={!!errors.confirm_password}
                  helperText={errors.confirm_password?.message ?? ''}
                />
              )}
            />

            {/* Submit */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
              sx={{ minHeight: 56 }}
            >
              {isSubmitting ? 'Creating...' : 'Register Organization'}
            </Button>

            <Divider />

            <Button
              variant="text"
              fullWidth
              onClick={() => navigate('/login')}
            >
              Already have an account? Sign In
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}