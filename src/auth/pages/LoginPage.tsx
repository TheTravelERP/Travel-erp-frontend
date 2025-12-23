import React from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Stack,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { loginSchema, type LoginInput } from "../../utils/validator";
import { loginApi } from "../services/auth.service";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "../../components/ui/SnackbarProvider";
import { Visibility, VisibilityOff } from "@mui/icons-material";

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
        org_code: ""
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

  const [showPassword, setShowPassword] = React.useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevents focus loss when clicking the icon
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
      {/* Login Container */}
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 3,
        }}
      >
        {/* Header */}
        <Stack spacing={1.5} alignItems="center" mb={3}>
          <Typography variant="h5" color="primary">
            Travel ERP
          </Typography>
    
          <Typography variant="body2" color="text.secondary">
            Sign in to continue
          </Typography>
        </Stack>
    
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
                <TextField
                  {...field}
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message ?? 'Min 8 characters'}
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
    
            {/* Submit */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              sx={{ minHeight: 56 }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
    
            <Divider />
    
            {/* Register */}
            <Button
              variant="text"
              fullWidth
              onClick={() => navigate('/register')}
            >
              Don&apos;t have an account? Register
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
