// src/features/booking/bookingReminder.types.ts

export interface BookingReminderFormInput {
  assigned_user_uuid: string;
  followup_type: string;
  followup_datetime: string;
  next_followup_datetime?: string;
  discussion_notes: string;
  priority: string;
  status?: string;
  outcome?: string;
}

export interface BookingReminderDetail extends BookingReminderFormInput {
  uuid: string;
  assigned_user_name?: string | null;
  status: string;
  version_no: number;
}
