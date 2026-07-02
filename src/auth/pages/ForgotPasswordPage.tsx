// src/auth/pages/ForgotPasswordPage.tsx

import React, { useState } from "react";

import { Box, Button, Divider, Stack, TextField } from "@mui/material";

import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "../../utils/validator";

import { forgotPasswordRequestOtpApi } from "../services/auth.service";

import { useNavigate } from "react-router-dom";

import { useSnackbar } from "../../components/ui/SnackbarProvider";

import AuthCard from "../components/AuthCard";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const { showSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);

  const { control, handleSubmit } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    try {
      setLoading(true);

      await forgotPasswordRequestOtpApi(values.email);

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
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your registered email address."
    >
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
            disabled={loading}
            sx={{
              minHeight: 56,
            }}
          >
            {loading ? "Sending..." : "Send OTP"}
          </Button>

          <Divider />

          <Button variant="text" fullWidth onClick={() => navigate("/login")}>
            Back to Login
          </Button>
        </Stack>
      </Box>
    </AuthCard>
  );
}
