// src/auth/pages/RegisterPage.tsx
import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Stack,
  Divider,
  Alert,
  Autocomplete,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import {
  registerOrgSchema,
  type RegisterOrgInput,
} from "../../utils/validator";
import { requestRegistrationOtp, verifyOtpApi } from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../components/ui/SnackbarProvider";
import { getCountries } from "../../services/public.service";
import type { OtpInputHandle } from "../../components/common/OtpInput";
import OtpInput from "../../components/common/OtpInput";
import AuthCard from "../components/AuthCard";
import PasswordField from "../../components/common/PasswordField";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [countries, setCountries] = React.useState<any[]>([]);
  const [countryLoading, setCountryLoading] = React.useState(false);
  const [selectedPhoneCountry, setSelectedPhoneCountry] = useState<any | null>(
    null,
  );
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const otpRef = useRef<OtpInputHandle>(null);

  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [registrationPayload, setRegistrationPayload] =
    useState<RegisterOrgInput | null>(null);

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    reset,
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

  async function onSubmit(data: RegisterOrgInput) {
    setGlobalError(null);
    try {
      // Create a shallow copy of the form data
      const payload = { ...data };

      // Append selected country phone code prefix to raw mobile sequence before delivery
      if (selectedPhoneCountry?.phone_code && payload.mobile) {
        // Strip out hyphens or spaces from complex codes (e.g., "1-684" -> "1684")
        const cleanPhoneCode = selectedPhoneCountry.phone_code.replace(
          /[^0-9]/g,
          "",
        );
        payload.mobile = `+${cleanPhoneCode}${payload.mobile}`;
      }

      await requestRegistrationOtp(payload);
      setRegistrationPayload(payload);
      setOtpSent(true);
      setCountdown(60);
      showSnackbar({ message: "OTP sent successfully", severity: "success" });
    } catch (err: any) {
      const detail = err?.response?.data;
      const messageFromApi =
        detail?.detail ||
        detail?.message ||
        (typeof detail === "string" ? detail : null);

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

  React.useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      setCountryLoading(true);
      const res = await getCountries();
      const items = res.items || [];
      setCountries(items);
      const india = items.find((x) => x.iso_code === "IN") || items[0];

      setValue("country_code", india.iso_code);

      setSelectedPhoneCountry(india);
    } catch (error) {
      console.error(error);
    } finally {
      setCountryLoading(false);
    }
  };

  React.useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerifyOtp = async () => {
    try {
      setOtpLoading(true);
      const res = await verifyOtpApi({
        email: registrationPayload?.email || "",
        otp,
      });

      showSnackbar({ message: res.message, severity: "success" });
      // Reset the form and OTP state after successful verification
      reset();
      setOtp("");
      setOtpSent(false);
      setRegistrationPayload(null);
      setCountdown(0);
      otpRef.current?.clear();

      navigate("/login", {
        replace: true,
      });
    } catch (err: any) {
      const message = err?.response?.data?.detail || "OTP verification failed";
      if (message === "Invalid OTP" || message === "OTP expired") {
        setOtp("");

        otpRef.current?.clear();
        otpRef.current?.focus();
      }
      showSnackbar({ message, severity: "error" });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!registrationPayload) return;

    try {
      setResendLoading(true);
      await requestRegistrationOtp(registrationPayload);
      setCountdown(60);
      setOtp("");
      otpRef.current?.clear();

      setTimeout(() => {
        otpRef.current?.focus();
      }, 50);
      showSnackbar({ message: "OTP resent successfully", severity: "success" });
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || "Failed to resend OTP",
        severity: "error",
      });
    } finally {
      setResendLoading(false);
      otpRef.current?.focus();
    }
  };

  const isOtpComplete = otp.length === 6;
  React.useEffect(() => {
    if (!otpSent) return;

    setTimeout(() => {
      otpRef.current?.focus();
    }, 100);
  }, [otpSent]);

  return (
    <AuthCard title="Travel ERP" subtitle="Create your organization">
      {globalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {globalError}
        </Alert>
      )}

      {!otpSent && (
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          mt={1}
          noValidate
        >
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
                  helperText={errors.organization_name?.message ?? ""}
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
                  required
                  error={!!errors.email}
                  helperText={errors.email?.message ?? ""}
                />
              )}
            />

            <Controller
              name="country_code"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  options={countries}
                  loading={countryLoading}
                  value={
                    countries.find((x) => x.iso_code === field.value) || null
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.iso_code === value?.iso_code
                  }
                  getOptionLabel={(option) => option?.label || ""}
                  onChange={(_, value) => {
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
                        <img src={option.flag_url} width={20} alt="" />
                        {option.label} ({option.iso_code})
                      </Box>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Profile Country"
                      error={!!errors.country_code}
                      helperText={errors.country_code?.message}
                    />
                  )}
                />
              )}
            />

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
                  option ? `${option.label} (+${option.phone_code})` : ""
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
                      <img src={option.flag_url} width={20} alt="" />
                      {option.label} ({option.iso_code})
                    </Box>
                  );
                }}
                renderInput={(params) => <TextField {...params} label="Code" />}
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
                <PasswordField
                  {...field}
                  fullWidth
                  label="Password"
                  required
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  autoComplete="new-password"
                />
              )}
            />

            <Controller
              name="confirm_password"
              control={control}
              render={({ field }) => (
                <PasswordField
                  {...field}
                  fullWidth
                  label="Confirm Password"
                  required
                  error={!!errors.confirm_password}
                  helperText={errors.confirm_password?.message}
                  autoComplete="new-password"
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
              {isSubmitting ? "Creating..." : "Register Organization"}
            </Button>

            <Divider />

            <Button variant="text" fullWidth onClick={() => navigate("/login")}>
              Already have an account? Sign In
            </Button>
          </Stack>
        </Box>
      )}
      {otpSent && (
        <Stack spacing={2}>
          <Alert severity="success">
            We've sent a 6-digit verification code to{" "}
            <strong>{registrationPayload?.email}</strong>. Please enter it below
            to complete your registration.
          </Alert>

          <OtpInput
            ref={otpRef}
            value={otp}
            onChange={setOtp}
            disabled={otpLoading}
          />

          <Button
            variant="contained"
            disabled={!isOtpComplete || otpLoading}
            onClick={handleVerifyOtp}
          >
            {otpLoading ? "Verifying..." : "Verify OTP"}
          </Button>

          <Button
            variant="outlined"
            disabled={resendLoading || countdown > 0}
            onClick={handleResendOtp}
          >
            {resendLoading
              ? "Sending..."
              : countdown > 0
                ? `Resend OTP (${countdown}s)`
                : "Resend OTP"}
          </Button>
          <Button
            variant="text"
            fullWidth
            onClick={() => {
              setOtpSent(false);
              setOtp("");
              setCountdown(0);
              setRegistrationPayload(null);
              otpRef.current?.clear();
            }}
          >
            ← Back to Registration
          </Button>
        </Stack>
      )}
    </AuthCard>
  );
}
