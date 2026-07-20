// src/utils/validator.ts
import { z } from "zod";
import type { TFunction } from "i18next";

/**
 * Reusable base validators and schemas.
 * All validation messages are translated — call with the active t()
 * so error text follows the user's selected language.
 */

export const getValidators = (t: TFunction) => ({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, t("validation.emailRequired"))
    .email(t("validation.emailInvalid")),

  password: z
    .string()
    .min(6, t("validation.passwordMinLength"))
    .max(36, t("validation.passwordMaxLength"))
    .regex(/[A-Z]/, t("validation.passwordUppercase"))
    .regex(/[a-z]/, t("validation.passwordLowercase"))
    .regex(/[0-9]/, t("validation.passwordNumber")),

  name: z
    .string()
    .trim()
    .min(3, t("validation.minLength3"))
    .max(200, t("validation.tooLong")),

  mobile: z
    .string()
    .min(7, t("validation.mobileRequired"))
    .max(15, t("validation.mobileTooLong"))
    .regex(/^[0-9]+$/, t("validation.digitsOnly")),

  countryCode: z
    .string()
    .length(2, t("validation.countryCodeLength"))
    .regex(/^[A-Z]{2}$/, t("validation.countryCodeFormat")),

  internationalMobile: z
    .string()
    .trim()
    .regex(/^\+[1-9][0-9]{6,14}$/, t("validation.internationalMobile")),

  otp: z
    .string()
    .length(6, t("validation.otpLength"))
    .regex(/^\d{6}$/, t("validation.otpDigitsOnly")),

  confirmPasswordRequired: z.string().min(1, t("validation.confirmPasswordRequired")),
});

// full form schema (shape the frontend sends)
export const getRegisterOrgSchema = (t: TFunction) => {
  const v = getValidators(t);
  return z
    .object({
      organization_name: v.name,
      country_code: v.countryCode,
      admin_name: v.name,
      email: v.email,
      mobile: v.mobile,
      password: v.password,
      confirm_password: v.confirmPasswordRequired,
    })
    .refine((data) => data.password === data.confirm_password, {
      message: t("validation.passwordMismatch"),
      path: ["confirm_password"],
    });
};
export type RegisterOrgInput = z.infer<ReturnType<typeof getRegisterOrgSchema>>;

export const getLoginSchema = (t: TFunction) => {
  const v = getValidators(t);
  return z.object({
    email: v.email,
    password: v.password,
  });
};
export type LoginInput = z.infer<ReturnType<typeof getLoginSchema>>;

export const getForgotPasswordSchema = (t: TFunction) =>
  z.object({
    email: getValidators(t).email,
  });
export type ForgotPasswordInput = z.infer<ReturnType<typeof getForgotPasswordSchema>>;

export const getResetPasswordSchema = (t: TFunction) => {
  const v = getValidators(t);
  return z
    .object({
      password: v.password,
      confirm_password: v.confirmPasswordRequired,
    })
    .refine((data) => data.password === data.confirm_password, {
      message: t("validation.passwordMismatch"),
      path: ["confirm_password"],
    });
};
export type ResetPasswordInput = z.infer<ReturnType<typeof getResetPasswordSchema>>;

export const getChangePasswordSchema = (t: TFunction) => {
  const v = getValidators(t);
  return z
    .object({
      old_password: z.string().min(1, t("validation.currentPasswordRequired")),
      new_password: v.password,
      confirm_password: v.confirmPasswordRequired,
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: t("validation.passwordMismatch"),
      path: ["confirm_password"],
    });
};
export type ChangePasswordInput = z.infer<ReturnType<typeof getChangePasswordSchema>>;
