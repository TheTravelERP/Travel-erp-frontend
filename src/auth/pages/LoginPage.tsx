import React from "react";
import {
  Box,
  Button,
  TextField,
  Stack,
  Divider,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { loginSchema, type LoginInput } from "../../utils/validator";
import { loginApi } from "../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "../../components/ui/SnackbarProvider";
import AuthCard from "../components/AuthCard";
import PasswordField from "../../components/common/PasswordField";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { login } = useAuth();
  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    try {
      const res = await loginApi(values);

      login({
        user_id: res.user_id,
        org_id: res.org_id,
        email: res.email,
        org_code: "",
      });
      showSnackbar({ message: "Login successful", severity: "success" });

      const redirectTo = location?.state?.from || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Invalid email or password";

      showSnackbar({ message: msg, severity: "error" });
    }
  }

  return (
    <AuthCard title="Travel ERP" subtitle="Sign in to continue">
      {/* Form */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          {/* Email */}
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />

          {/* Password */}
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <PasswordField
                {...field}
                fullWidth
                label="Password"
                error={!!errors.password}
                helperText={errors.password?.message ?? "Min 8 characters"}
                autoComplete="current-password"
              />
            )}
          />

          {/* Submit */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
                Sign In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <Divider sx={{ my: 2 }} />

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              variant="text"
              size="small"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot your password?
            </Button>

            <Button
              variant="text"
              size="small"
              onClick={() => navigate("/register")}
            >
              Create account
            </Button>
          </Box>
        </Stack>
      </Box>
    </AuthCard>
  );
}
