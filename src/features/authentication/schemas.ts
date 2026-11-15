import { z } from "zod"

const email = z
  .email("Enter a valid email address.")
  .max(254, "That email address is too long.")
  .transform((value) => value.toLowerCase())

/**
 * At least 10 characters with a letter and a number. Length matters far more
 * than symbol rules, so we ask for length and keep the rules short.
 */
const newPassword = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(72, "Use 72 characters or fewer.")
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/[0-9]/, "Include at least one number.")

export const signUpSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Tell us what to call you.")
    .max(60, "Use 60 characters or fewer."),
  email,
  password: newPassword,
  acceptTerms: z.literal(true, "Please confirm you are an adult and accept the privacy notice."),
})

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password.").max(72),
})

export const passwordResetRequestSchema = z.object({ email })

export const updatePasswordSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "The two passwords do not match.",
  })

export type SignUpInput = z.infer<typeof signUpSchema>
