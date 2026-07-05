// src/auth/pages/ForgotPasswordPage.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "../../utils/validator";
import {
  forgotPasswordRequestOtpApi,
  forgotPasswordVerifyOtpApi,
  resetPasswordApi,
} from "../services/auth.service";
import PasswordField from "../../components/common/PasswordField";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../../components/ui/SnackbarProvider";
import AuthCard from "../components/AuthCard";
import OtpInput, {
  type OtpInputHandle,
} from "../../components/common/OtpInput";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [requestOtpLoading, setRequestOtpLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const isOtpComplete = otp.length === 6;

  const otpRef = useRef<OtpInputHandle>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  useEffect(() => {
    if (step !== "otp") return;
    const timer = setTimeout(() => {
      otpRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [step]);

  const { control, handleSubmit } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    try {
      setRequestOtpLoading(true);
      await forgotPasswordRequestOtpApi(values.email);
      setEmail(values.email);
      setStep("otp");
      setCountdown(60);
      showSnackbar({
        message: "OTP sent successfully.",
        severity: "success",
      });
      /**
       * Next step
       * (We'll implement this next)
       */
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || "Failed to send OTP.",
        severity: "error",
      });
    } finally {
      setRequestOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setOtpLoading(true);
      const res = await forgotPasswordVerifyOtpApi({
        email,
        otp,
      });

      showSnackbar({
        message: res.message,
        severity: "success",
      });

      setStep("reset");
    } catch (err: any) {
      const message = err?.response?.data?.detail || "OTP verification failed";

      if (message === "Invalid OTP" || message === "OTP expired") {
        setOtp("");

        otpRef.current?.clear();
        otpRef.current?.focus();
      }

      showSnackbar({
        message,
        severity: "error",
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setRequestOtpLoading(true);

      await forgotPasswordRequestOtpApi(email);

      setCountdown(60);

      setOtp("");

      otpRef.current?.clear();

      setTimeout(() => {
        otpRef.current?.focus();
      }, 50);

      showSnackbar({
        message: "OTP resent successfully.",
        severity: "success",
      });
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || "Failed to resend OTP.",
        severity: "error",
      });
    } finally {
      setRequestOtpLoading(false);

      otpRef.current?.focus();
    }
  };

  const {
    control: resetControl,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors, isSubmitting: resetSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirm_password: "",
    },
  });

  const handleResetPassword = async (values: ResetPasswordInput) => {
    try {
      setResetLoading(true);

      const res = await resetPasswordApi({
        email,
        otp,
        password: values.password,
      });

      showSnackbar({
        message: res.message,
        severity: "success",
      });

      navigate("/login", {
        replace: true,
      });
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail ?? "Failed to reset password.",
        severity: "error",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <AuthCard
      title="Travel ERP"
      subtitle="Frogot Password? Enter your email to receive an OTP."
    >
      {step === "email" && (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2}>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  autoFocus
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={requestOtpLoading}
            >
              {requestOtpLoading ? (
                <>
                  <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                  Sending...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>

            <Divider />

            <Button variant="text" fullWidth onClick={() => navigate("/login")}>
              Back to Login
            </Button>
          </Stack>
        </Box>
      )}

      {step === "otp" && (
        <Stack spacing={2}>
          <Box
            sx={{
              textAlign: "center",
            }}
          >
            We've sent a 6-digit verification code to
            <Box
              component="div"
              sx={{
                fontWeight: 600,
                mt: 0.5,
              }}
            >
              {email}
            </Box>
          </Box>

          <OtpInput
            ref={otpRef}
            value={otp}
            onChange={setOtp}
            disabled={otpLoading}
          />

          <Button
            variant="contained"
            fullWidth
            disabled={!isOtpComplete || otpLoading}
            onClick={handleVerifyOtp}
          >
            {otpLoading ? (
              <>
                <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            disabled={requestOtpLoading || countdown > 0}
            onClick={handleResendOtp}
          >
            {requestOtpLoading ? (
              <>
                <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                Sending...
              </>
            ) : countdown > 0 ? (
              `Resend OTP (${countdown}s)`
            ) : (
              "Resend OTP"
            )}
          </Button>

          <Divider />

          <Button
            variant="text"
            fullWidth
            onClick={() => {
              setStep("email");
              setOtp("");
              setCountdown(0);
              otpRef.current?.clear();
            }}
          >
            ← Back
          </Button>
        </Stack>
      )}

      {step === "reset" && (
        <Box
          component="form"
          onSubmit={handleResetSubmit(handleResetPassword)}
          noValidate
        >
          <Stack spacing={2}>
            <Controller
              name="password"
              control={resetControl}
              render={({ field }) => (
                <PasswordField
                  {...field}
                  fullWidth
                  label="New Password"
                  autoComplete="new-password"
                  error={!!resetErrors.password}
                  helperText={resetErrors.password?.message}
                />
              )}
            />

            <Controller
              name="confirm_password"
              control={resetControl}
              render={({ field }) => (
                <PasswordField
                  {...field}
                  fullWidth
                  label="Confirm Password"
                  autoComplete="new-password"
                  error={!!resetErrors.confirm_password}
                  helperText={resetErrors.confirm_password?.message}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={resetLoading}
              sx={{
                minHeight: 56,
              }}
            >
              {resetLoading ? "Resetting..." : "Reset Password"}
            </Button>

            <Divider />

            <Button variant="text" fullWidth onClick={() => navigate("/login")}>
              Back to Login
            </Button>
          </Stack>
        </Box>
      )}
    </AuthCard>
  );
}
