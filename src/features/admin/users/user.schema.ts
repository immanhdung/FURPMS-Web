import { z } from "zod";

const baseUserFields = {
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().optional(),
  department: z.string().optional(),
  academicDegree: z.number().int().optional(),
  roles: z.array(z.string()).min(1, "Select at least one role"),
};

export const createUserSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  ...baseUserFields,
  temporaryPassword: z.string().min(8, "Temporary password must be at least 8 characters"),
});

export const editUserSchema = z.object(baseUserFields);

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type EditUserFormValues = z.infer<typeof editUserSchema>;
