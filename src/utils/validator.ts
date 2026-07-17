// src/utils/validator.ts
import { z } from "zod";

/**
 * Reusable base validators and schemas.
 * Export individual field validators too if you want to reuse in other places.
 */

// simple reusable pieces
export const emailValidator = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .email("Enter a valid email");

export const passwordValidator = z
  .string()
  .min(6, "Password must be at least 8 characters")
  .max(36, "Password cannot exceed 36 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");


export const nameValidator = z
  .string()
  .trim()
  .min(3, "Must be at least 3 characters")
  .max(200, "Too long");

export const mobileValidator = z
  .string()
  .min(7, "Mobile number is required")
  .max(15, "Mobile number too long")
  .regex(/^[0-9]+$/, "Only digits allowed");

export const countryCodeValidator = z
  .string()
  .length(2, "Country code must be exactly 2 characters")
  .regex(/^[A-Z]{2}$/, "Country code must be 2 uppercase letters");

export const internationalMobileValidator = z
  .string()
  .trim()
  .regex(
    /^\+[1-9][0-9]{6,14}$/,
    "Enter a valid international mobile number (e.g. +919876543210)"
  );


export const otpValidator = z
  .string()
  .length(6, "OTP must be exactly 6 digits")
  .regex(/^\d{6}$/, "OTP must contain only digits");


// full form schema (shape the frontend sends)
export const registerOrgSchema = z
  .object({
    organization_name: nameValidator,
    country_code: countryCodeValidator,
    admin_name: nameValidator,
    email: emailValidator,
    mobile: mobileValidator,
    password: passwordValidator,
    confirm_password: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Password and confirm password does not match",
    path: ["confirm_password"],
  });
export type RegisterOrgInput = z.infer<typeof registerOrgSchema>;

export const loginSchema = z.object({
  email: emailValidator,
  password: passwordValidator,
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailValidator,
});

export const resetPasswordSchema = z
  .object({
    password: passwordValidator,
    confirm_password: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Password and confirm password does not match",
    path: ["confirm_password"],
  });

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    old_password: z.string().min(1, "Current password is required"),
    new_password: passwordValidator,
    confirm_password: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Password and confirm password does not match",
    path: ["confirm_password"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;




