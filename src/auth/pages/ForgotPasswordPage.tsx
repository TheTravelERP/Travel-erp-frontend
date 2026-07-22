// src/auth/pages/ForgotPasswordPage.tsx

import { useEffect, useMemo, useRef, useState } from "react";
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
import { useTranslation } from "react-i18next";
import {
  getForgotPasswordSchema,
  getResetPasswordSchema,
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
  const { t } = useTranslation();
  const forgotPasswordSchema = useMemo(() => getForgotPasswordSchema(t), [t]);
  const resetPasswordSchema = useMemo(() => getResetPasswordSchema(t), [t]);

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
        message: t("auth.otpSentSuccess"),
        severity: "success",
      });
      /**
       * Next step
       * (We'll implement this next)
       */
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("auth.otpSendFailed"),
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
      const message = err?.response?.data?.detail || t("auth.otpVerificationFailed");

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
        message: t("auth.otpResentSuccess"),
        severity: "success",
      });
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail || t("auth.otpResendFailed"),
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
    formState: { errors: resetErrors },
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
        message: err?.response?.data?.detail ?? t("auth.resetPasswordFailed"),
        severity: "error",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <AuthCard
      title={t("auth.appTitle")}
      subtitle={t("auth.forgotPasswordSubtitle")}
    >
      {step === "email" && (
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit, () =>
            showSnackbar({ message: t("validation.fixHighlightedFields"), severity: "error" }),
          )}
          noValidate
        >
          <Stack spacing={2}>
            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t("common.email")}
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
                  {t("auth.sending")}
                </>
              ) : (
                t("auth.sendOtp")
              )}
            </Button>

            <Divider />

            <Button variant="text" fullWidth onClick={() => navigate("/login")}>
              {t("auth.backToLogin")}
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
            {t("auth.otpSentTo")}
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
                {t("auth.verifying")}
              </>
            ) : (
              t("auth.verifyOtp")
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
                {t("auth.sending")}
              </>
            ) : countdown > 0 ? (
              t("auth.resendOtpCountdown", { count: countdown })
            ) : (
              t("auth.resendOtp")
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
            {t("common.back")}
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
                  label={t("profile.newPassword")}
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
                  label={t("profile.confirmPassword")}
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
              {resetLoading ? t("auth.resetting") : t("auth.resetPassword")}
            </Button>

            <Divider />

            <Button variant="text" fullWidth onClick={() => navigate("/login")}>
              {t("auth.backToLogin")}
            </Button>
          </Stack>
        </Box>
      )}
    </AuthCard>
  );
}
