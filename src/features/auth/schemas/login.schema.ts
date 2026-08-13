import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Phải nhập email.").email("Enter a valid email address"),
  password: z.string().min(1, "Phải nhập mật khẩu."),
  rememberMe: z.boolean(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
