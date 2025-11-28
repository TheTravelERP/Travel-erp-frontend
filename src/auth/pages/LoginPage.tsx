import React from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { loginSchema, type LoginInput } from "../../utils/validator";
import { loginApi } from "../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "../../components/ui/SnackbarProvider";

const Card = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: "100%",
  maxWidth: 380,
  borderRadius: 12,
}));

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
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        backgroundColor: "background.default",
        px: 2,
      }}
    >
      <Card elevation={4}>
        <Stack spacing={2} alignItems="center">
         <Typography variant="h4" color="primary.main">
            Travel ERP
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Sign in to continue
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} mt={2}>
          <Stack spacing={2}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Email"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Password"
                  type="password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>

            <Divider />

            <Button
              variant="text"
              fullWidth
              onClick={() => navigate("/register")}
            >
              Don't have an account? Register
            </Button>
          </Stack>
        </Box>
      </Card>
    </Box>
  );
}
