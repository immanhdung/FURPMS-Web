import { z } from "zod";

const baseUserFields = {
  fullName: z.string().min(1, "Phải nhập họ và tên."),
  phoneNumber: z.string().optional(),
  department: z.string().optional(),
  academicDegree: z.number().int().optional(),
  roles: z.array(z.string()).min(1, "Phải chọn ít nhất một vai trò."),
};

export const createUserSchema = z.object({
  email: z.string().min(1, "Phải nhập email.").email("Enter a valid email address"),
  ...baseUserFields,
  temporaryPassword: z.string().min(8, "Mật khẩu tạm phải có ít nhất 8 ký tự."),
});

export const editUserSchema = z.object(baseUserFields);

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type EditUserFormValues = z.infer<typeof editUserSchema>;
