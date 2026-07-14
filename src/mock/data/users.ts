import { ROLES } from "@/constants/roles";
import type { User } from "@/types/auth";

export interface MockAccount {
  password: string;
  user: User;
}

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    password: "password",
    user: { id: "u-1", fullName: "Nguyen Van Admin", email: "admin@fpt.edu.vn", roles: [ROLES.ADMIN] },
  },
  {
    password: "password",
    user: { id: "u-2", fullName: "Tran Thi Staff", email: "staff@fpt.edu.vn", roles: [ROLES.STAFF] },
  },
  {
    password: "password",
    user: { id: "u-3", fullName: "Le Van Faculty", email: "faculty@fpt.edu.vn", roles: [ROLES.FACULTY] },
  },
  {
    password: "password",
    user: {
      id: "u-4",
      fullName: "Pham Thi Reviewer",
      email: "reviewer@fpt.edu.vn",
      roles: [ROLES.REVIEW_COMMITTEE],
    },
  },
];
