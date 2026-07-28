// src/features/settings/eventAutomation/eventAutomation.types.ts

export type TriggerType =
  | "IMMEDIATE"
  | "BEFORE_5_MIN"
  | "BEFORE_15_MIN"
  | "BEFORE_30_MIN"
  | "BEFORE_1_HOUR"
  | "BEFORE_1_DAY"
  | "CUSTOM_OFFSET";

export type RecipientType =
  | "ASSIGNED_USER"
  | "CUSTOMER"
  | "REPORTING_MANAGER"
  | "BOOKING_AGENT"
  | "SPECIFIC_EMAIL"
  | "SPECIFIC_MOBILE";

export interface RecipientItem {
  type: RecipientType;
  value?: string;
}

export type ConditionOperator = "eq" | "neq" | "in";

export interface ConditionItem {
  field: string;
  operator: ConditionOperator;
  value: any;
}

export interface EventRuleItem {
  event_code: string;
  event_name: string;
  module_group: string;
  description?: string;

  is_configured: boolean;
  rule_uuid?: string;
  version_no?: number;
  is_active: boolean;

  email_enabled: boolean;
  whatsapp_enabled: boolean;
  sms_enabled: boolean;
  trigger_type: TriggerType;
  custom_offset_minutes?: number;
  recipients: RecipientItem[];

  email_template_uuid?: string;
  email_template_name?: string;
  whatsapp_template_uuid?: string;
  whatsapp_template_name?: string;
  sms_template_uuid?: string;
  sms_template_name?: string;

  conditions: ConditionItem[];
}

export interface EventRuleListApiResponse {
  data: EventRuleItem[];
}

export interface EventRuleUpsertPayload {
  is_active: boolean;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  sms_enabled: boolean;
  trigger_type: TriggerType;
  custom_offset_minutes?: number | null;
  recipients: RecipientItem[];
  email_template_uuid?: string | null;
  whatsapp_template_uuid?: string | null;
  sms_template_uuid?: string | null;
  conditions: ConditionItem[];
  version_no?: number | null;
}
