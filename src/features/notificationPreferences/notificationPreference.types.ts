// src/features/notificationPreferences/notificationPreference.types.ts

export interface NotificationPreference {
  in_app_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;

  working_hours_enabled: boolean;
  working_hours_start?: string | null;
  working_hours_end?: string | null;

  quiet_hours_enabled: boolean;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;

  daily_digest_enabled: boolean;
  weekly_digest_enabled: boolean;

  low_priority_mute: boolean;
}
