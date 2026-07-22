// src/features/settings/users/components/UserForm.tsx
import { Box, Button, TextField, Typography, Paper, Divider, MenuItem, Grid } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getUserCreateSchema, getUserUpdateSchema, type UserCreateFormInput, type UserUpdateFormInput } from '../users.schema';
import DropdownAutocomplete from '../../../../components/common/DropdownAutocomplete';
import PasswordField from '../../../../components/common/PasswordField';
import FileUploadField from '../../../../components/common/FileUploadField';
import { uploadFile } from '../../../../services/upload.service';
import { useSnackbar } from '../../../../components/ui/SnackbarProvider';
import { mergeFormDefaults } from '../../../../utils/mergeFormDefaults';

const USER_TYPES = ['Admin', 'Employee', 'Agent'];
const STATUSES = ['Active', 'Inactive', 'Suspended'];

type UserFormInput = UserCreateFormInput & Partial<Pick<UserUpdateFormInput, 'status'>>;

interface UserFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<UserFormInput> & { email?: string };
  onSubmit: (data: UserFormInput) => Promise<void>;
  loading?: boolean;
}

const emptyValues: UserFormInput = {
  name: '',
  email: '',
  mobile: '',
  user_type: 'Employee',
  password: '',
  status: 'Active',
  dob: '',
  gender: '',
  marital_status: '',
  anniversary_date: '',
  blood_group: '',
  designation: '',
  date_of_joining: '',
  picture_url: '',
  emergency_contact_name: '',
  emergency_contact_number: '',
  identification_type: '',
  identification_number: '',
  identification_file_url: '',
};

export default function UserForm({ mode, defaultValues, onSubmit, loading = false }: UserFormProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const userCreateSchema = useMemo(() => getUserCreateSchema(t), [t]);
  const userUpdateSchema = useMemo(() => getUserUpdateSchema(t), [t]);
  const schema = mode === 'create' ? userCreateSchema : userUpdateSchema;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormInput>({
    resolver: zodResolver(schema as any),
    defaultValues: mergeFormDefaults(emptyValues, defaultValues),
  });

  useEffect(() => {
    if (defaultValues) {
      reset(mergeFormDefaults(emptyValues, defaultValues));
    }
  }, [defaultValues, reset]);

  const pictureUrl = watch('picture_url');
  const identificationFileUrl = watch('identification_file_url');

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit, () =>
        showSnackbar({ message: t('validation.fixHighlightedFields'), severity: 'error' }),
      )}
      noValidate
      sx={{ flexGrow: 1 }}
    >
      <Grid container spacing={2}>
        {/* ACCOUNT */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
              {t('settings.account')}
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('settings.fullName')}
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label={t('common.email')}
                  fullWidth
                  disabled={mode === 'edit'}
                  value={mode === 'edit' ? defaultValues?.email ?? '' : watch('email')}
                  onChange={(e) => mode === 'create' && setValue('email', e.target.value)}
                  error={mode === 'create' && !!(errors as any).email}
                  helperText={mode === 'create' ? (errors as any).email?.message : undefined}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="mobile"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('common.mobile')}
                      fullWidth
                      placeholder="+14155550100"
                      error={!!errors.mobile}
                      helperText={errors.mobile?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: mode === 'create' ? 3 : 6 }}>
                <Controller
                  name="user_type"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label={t('settings.role')} fullWidth>
                      {USER_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {t(`settings.userType.${type}`, { defaultValue: type })}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Grid>

              {mode === 'create' && (
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <PasswordField
                        {...field}
                        label={t('settings.initialPassword')}
                        fullWidth
                        autoComplete="new-password"
                        error={!!(errors as any).password}
                        helperText={(errors as any).password?.message}
                      />
                    )}
                  />
                </Grid>
              )}

              {mode === 'edit' && (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} select label={t('common.status')} fullWidth value={field.value ?? 'Active'}>
                        {STATUSES.map((status) => (
                          <MenuItem key={status} value={status}>
                            {t(`settings.userStatus.${status}`, { defaultValue: status })}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <FileUploadField
                  label={t('settings.profilePicture')}
                  variant="avatar"
                  value={pictureUrl || null}
                  onUpload={async (file) => {
                    const { url } = await uploadFile(file, 'user', 'picture');
                    return url;
                  }}
                  onChange={(url) => setValue('picture_url', url ?? '')}
                  accept="image/jpeg,image/png,image/webp"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* PERSONAL DETAILS */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
              {t('settings.personalDetails')}
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 3 }}>
                <Controller
                  name="dob"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('settings.dateOfBirth')}
                      type="date"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <DropdownAutocomplete name="gender" label={t('settings.gender')} control={control} useForm allowAdd={false} />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <DropdownAutocomplete
                  name="marital_status"
                  label={t('settings.maritalStatus')}
                  control={control}
                  useForm
                  allowAdd={false}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <Controller
                  name="anniversary_date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('settings.anniversaryDate')}
                      type="date"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <DropdownAutocomplete
                  name="blood_group"
                  label={t('settings.bloodGroup')}
                  control={control}
                  useForm
                  allowAdd={false}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* EMPLOYMENT */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
              {t('settings.employment')}
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <DropdownAutocomplete
                  name="designation"
                  label={t('settings.designation')}
                  control={control}
                  useForm
                  allowAdd
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="date_of_joining"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('settings.dateOfJoining')}
                      type="date"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* EMERGENCY CONTACT */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
              {t('settings.emergencyContact')}
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="emergency_contact_name"
                  control={control}
                  render={({ field }) => <TextField {...field} label={t('settings.contactName')} fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="emergency_contact_number"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label={t('settings.contactNumber')} fullWidth placeholder="+14155550100" />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* IDENTIFICATION */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 3 }}>
              {t('settings.identification')}
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <DropdownAutocomplete
                  name="identification_type"
                  label={t('settings.idType')}
                  control={control}
                  useForm
                  allowAdd={false}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="identification_number"
                  control={control}
                  render={({ field }) => <TextField {...field} label={t('settings.idNumber')} fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FileUploadField
                  label={t('settings.idDocument')}
                  variant="document"
                  value={identificationFileUrl || null}
                  onUpload={async (file) => {
                    const { url } = await uploadFile(file, 'user', 'identification');
                    return url;
                  }}
                  onChange={(url) => setValue('identification_file_url', url ?? '')}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* ACTIONS */}
        <Grid size={{ xs: 12 }}>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" justifyContent="space-between">
            <Button variant="outlined" onClick={() => navigate('/app/settings/users')}>
              {t('common.back')}
            </Button>
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting || loading}>
              {isSubmitting || loading ? t('common.saving') : t('settings.saveUser')}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
