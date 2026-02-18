import { z } from "zod";

export const AuthFormSchema = z.object({
  login: z.string().min(3, "Минимум 3 символа").max(16, "Максимум 16 символа"),
  password: z
    .string()
    .min(8, "Минимум 8 символов")
    .max(24, "Максимум 24 символа"),
});

export type AuthForm = z.infer<typeof AuthFormSchema>;
