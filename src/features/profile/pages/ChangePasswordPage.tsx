// src/features/profile/pages/ChangePasswordPage.tsx
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from '../../../utils/validator';
import { changePasswordApi } from '../../../auth/services/auth.service';
import PasswordField from '../../../components/common/PasswordField';
import { useSnackbar } from '../../../components/ui/SnackbarProvider';

export default function ChangePasswordPage() {
  const { showSnackbar } = useSnackbar();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (values: ChangePasswordInput) => {
    try {
      const res = await changePasswordApi({
        old_password: values.old_password,
        new_password: values.new_password,
      });

      showSnackbar({
        message: res.message || 'Password changed successfully.',
        severity: 'success',
      });

      reset();
    } catch (err: any) {
      showSnackbar({
        message: err?.response?.data?.detail ?? 'Failed to change password.',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Change Password
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Dashboard &bull; Profile &bull; Change Password
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 480 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2}>
            <Controller
              name="old_password"
              control={control}
              render={({ field }) => (
                <PasswordField
                  {...field}
                  fullWidth
                  label="Old Password"
                  autoComplete="current-password"
                  error={!!errors.old_password}
                  helperText={errors.old_password?.message}
                />
              )}
            />

            <Controller
              name="new_password"
              control={control}
              render={({ field }) => (
                <PasswordField
                  {...field}
                  fullWidth
                  label="New Password"
                  autoComplete="new-password"
                  error={!!errors.new_password}
                  helperText={errors.new_password?.message}
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
                  autoComplete="new-password"
                  error={!!errors.confirm_password}
                  helperText={errors.confirm_password?.message}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              sx={{ minHeight: 56 }}
            >
              {isSubmitting ? 'Changing...' : 'Change Password'}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
