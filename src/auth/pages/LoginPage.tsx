import { useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  Stack,
  Divider,
  CircularProgress,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { getLoginSchema, type LoginInput } from "../../utils/validator";
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
  const { t } = useTranslation();
  const loginSchema = useMemo(() => getLoginSchema(t), [t]);

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
        org_code: res.org_code,
        name: res.name,
        picture_url: res.picture_url,
        preferred_language: res.preferred_language,
      });
      showSnackbar({ message: t("auth.loginSuccess"), severity: "success" });

      const redirectTo = location?.state?.from || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        t("auth.invalidCredentials");

      showSnackbar({ message: msg, severity: "error" });
    }
  }

  return (
    <AuthCard title={t("auth.appTitle")} subtitle={t("auth.signInSubtitle")}>
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
                label={t("common.email")}
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
                label={t("auth.password")}
                error={!!errors.password}
                helperText={errors.password?.message ?? t("auth.minCharactersHint", { count: 8 })}
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
                {t("auth.signingIn")}
              </>
            ) : (
              t("auth.signIn")
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
              {t("auth.forgotPassword")}
            </Button>

            <Button
              variant="text"
              size="small"
              onClick={() => navigate("/register")}
            >
              {t("auth.createAccount")}
            </Button>
          </Box>
        </Stack>
      </Box>
    </AuthCard>
  );
}
