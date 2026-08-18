import { z } from "zod";

const baseUserFields = {
  fullName: z.string().min(1, "Full name is required."),
  phoneNumber: z.string().optional(),
  department: z.string().optional(),
  academicDegree: z.number().int().optional(),
  roles: z.array(z.string()).min(1, "Pick at least one role."),
};

export const createUserSchema = z.object({
  // Email là ĐỊNH DANH đăng nhập: gõ sai thì thư mời và mật khẩu tạm gửi đi đâu mất, người được
  // tạo không bao giờ vào được mà Admin cũng không biết vì sao. BE kiểm lại y hệt
  // (`UserService.IsValidEmail`) — đây chỉ để báo ngay khi đang gõ.
  email: z
    .string()
    .min(1, "Email is required.")
    .trim()
    .email("Enter a valid email address, e.g. name@fpt.edu.vn"),
  ...baseUserFields,
  temporaryPassword: z.string().min(8, "Temporary password must be at least 8 characters."),
});

export const editUserSchema = z.object(baseUserFields);

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type EditUserFormValues = z.infer<typeof editUserSchema>;
