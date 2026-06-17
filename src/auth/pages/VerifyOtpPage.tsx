// src/auth/pages/VerifyOtpPage.tsx

import React, { useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Stack,
  Alert,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSnackbar } from "../../components/ui/SnackbarProvider";
import {
  verifyOtpApi,
  resendOtpApi,
} from "../services/auth.service";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [searchParams] = useSearchParams();

  const emailFromUrl =
    searchParams.get("email") || "";

  const [email] = useState(emailFromUrl);

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const handleVerifyOtp = async () => {
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);

      const res = await verifyOtpApi({
        email,
        otp,
      });

      const message =
        res?.message ||
        "Registration completed successfully";

      setSuccess(message);

      showSnackbar({
        message,
        severity: "success",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        "OTP verification failed";

      setError(message);

      showSnackbar({
        message,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);

    try {
      setResending(true);

      const res = await resendOtpApi(
        email
      );

      const message =
        res?.message ||
        "OTP resent successfully";

      showSnackbar({
        message,
        severity: "success",
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        "Failed to resend OTP";

      setError(message);

      showSnackbar({
        message,
        severity: "error",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          maxWidth: 450,
          width: "100%",
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <Typography
            variant="h5"
            color="primary"
          >
            Verify OTP
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
          >
            Enter the OTP sent to
          </Typography>

          <Typography
            variant="body1"
            fontWeight={600}
          >
            {email}
          </Typography>
        </Stack>

        {error && (
          <Alert
            severity="error"
            sx={{ mt: 3 }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mt: 3 }}
          >
            {success}
          </Alert>
        )}

        <Stack spacing={2} mt={3}>
          <TextField
            label="OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value)
            }
            fullWidth
            inputProps={{
              maxLength: 6,
            }}
          />

          <Button
            variant="contained"
            fullWidth
            disabled={
              loading ||
              otp.trim().length !== 6
            }
            onClick={handleVerifyOtp}
          >
            {loading
              ? "Verifying..."
              : "Verify OTP"}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            disabled={resending}
            onClick={handleResendOtp}
          >
            {resending
              ? "Sending..."
              : "Resend OTP"}
          </Button>

          <Button
            variant="text"
            fullWidth
            onClick={() =>
              navigate("/login")
            }
          >
            Back to Login
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}