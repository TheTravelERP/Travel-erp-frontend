// src/utils/validator.ts
import { z } from "zod";

/**
 * Reusable base validators and schemas.
 * Export individual field validators too if you want to reuse in other places.
 */

// simple reusable pieces
export const emailValidator = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email");

export const passwordValidator = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password too long (max 72 chars)"); // bcrypt limit

export const nameValidator = z
  .string()
  .min(1, "This field is required")
  .max(200, "Too long");

export const mobileValidator = z
  .string()
  .optional()
  .refine((v) => !v || /^[0-9+\-()\s]{6,20}$/.test(v), {
    message: "Mobile looks invalid",
  });

// full form schema (shape the frontend sends)
export const registerOrgSchema = z.object({
  organization_name: nameValidator,
  country_code: nameValidator,
  admin_name: nameValidator,
  email: emailValidator,
  mobile: mobileValidator,
  password: passwordValidator,
});

// type for TS convenience
export type RegisterOrgInput = z.infer<typeof registerOrgSchema>;

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});


export type LoginInput = z.infer<typeof loginSchema>;
