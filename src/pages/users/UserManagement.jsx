import React, { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Search,
  UserPlus,
  Eye,
  Pencil,
  GraduationCap,
  Ban,
  MoreHorizontal,
  Users,
  AlertTriangle,
} from "lucide-react";
import { useUsers, useDeleteUser } from "../../hooks/useUsers";
import { LoadingState } from "../../components/shared/LoadingState";
import { EmptyState } from "../../components/shared/EmptyState";
import { Pagination } from "../../components/shared/Pagination";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { ROLE_OPTIONS, MOCK_UNITS } from "../../mocks/userMocks";
import { formatDate } from "../../lib/utils";

// ────────────────────────────────────────────────────────────────────────
// Role badge config
// ────────────────────────────────────────────────────────────────────────
const ROLE_BADGE = {
  Admin: { label: "Admin", color: "bg-violet-100 text-violet-700" },
  Staff: { label: "QLKH", color: "bg-blue-100 text-blue-700" },
  Faculty: { label: "Giảng viên", color: "bg-green-100 text-green-700" },
  PI: { label: "PI", color: "bg-amber-100 text-amber-700" },
  ReviewCommittee: { label: "Hội đồng", color: "bg-red-100 text-red-600" },
};

// ────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────

function UserAvatar({ name }) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(-2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div
      className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0"
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

function RoleBadges({ roles }) {
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => {
        const cfg = ROLE_BADGE[role] || {
          label: role,
          color: "bg-gray-100 text-gray-600",
        };
        return (
          <span
            key={role}
            className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full whitespace-nowrap ${cfg.color}`}
          >
            {cfg.label}
          </span>
        );
      })}
    </div>
  );
}

function UserActions({ user, onDeactivate }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const actions = [
    {
      label: "Xem chi tiết",
      icon: Eye,
      onClick: () => navigate(`/users/${user.id}/edit`),
    },
    {
      label: "Chỉnh sửa",
      icon: Pencil,
      onClick: () => navigate(`/users/${user.id}/edit`),
    },
    {
      label: "Hồ sơ khoa học",
      icon: GraduationCap,
      onClick: () => navigate(`/users/${user.id}/profile`),
    },
  ];

  if (user.isActive) {
    actions.push({
      label: "Vô hiệu hóa",
      icon: Ban,
      onClick: () => onDeactivate(user),
      className: "text-red-600",
    });
  }

  return (
    <div className="relative flex items-center justify-end">
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground"
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        aria-label={`Thao tác cho ${user.fullName}`}
        aria-expanded={showMenu}
      >
        <MoreHorizontal size={16} aria-hidden="true" />
      </Button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[180px] animate-in fade-in zoom-in-95 duration-150">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick();
                  setShowMenu(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted transition-colors ${
                  action.className || "text-foreground"
                }`}
              >
                <action.icon size={14} aria-hidden="true" />
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function UserTableRow({ user, onDeactivate }) {
  const navigate = useNavigate();

  return (
    <TableRow
      className="hover:bg-surface-variant/30 transition-colors cursor-pointer"
      onClick={() => navigate(`/users/${user.id}/edit`)}
      tabIndex={0}
      role="button"
      aria-label={`Xem chi tiết: ${user.fullName}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/users/${user.id}/edit`);
        }
      }}
    >
      {/* Avatar + Name + Email */}
      <TableCell>
        <div className="flex items-center gap-3">
          <UserAvatar name={user.fullName} />
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">
              {user.fullName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
      </TableCell>

      {/* Roles */}
      <TableCell>
        <RoleBadges roles={user.roles} />
      </TableCell>

      {/* Department */}
      <TableCell className="text-sm text-foreground">
        {user.isExternal ? (
          <span className="text-xs text-muted-foreground italic">
            Chuyên gia ngoài
          </span>
        ) : (
          user.unitName || "—"
        )}
      </TableCell>

      {/* Proposal Count */}
      <TableCell
        className="text-center text-sm font-medium text-foreground"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {user.proposalCount}
      </TableCell>

      {/* Status */}
      <TableCell>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              user.isActive ? "bg-green-500" : "bg-gray-400"
            }`}
            aria-hidden="true"
          />
          <span
            className={`text-xs font-medium ${
              user.isActive ? "text-green-700" : "text-muted-foreground"
            }`}
          >
            {user.isActive ? "Hoạt động" : "Vô hiệu"}
          </span>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="text-right">
        <UserActions user={user} onDeactivate={onDeactivate} />
      </TableCell>
    </TableRow>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────────────────
export default function UserManagement() {
  const navigate = useNavigate();

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [unitFilter, setUnitFilter] = useState("");
  const [page, setPage] = useState(1);

  // ConfirmDialog state
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Build filters for React Query
  const filters = {
    page,
    limit: 20,
    ...(roleFilter !== "ALL" && { role: roleFilter }),
    ...(unitFilter && { unitId: unitFilter }),
    ...(searchQuery.trim() && { search: searchQuery.trim() }),
  };

  // Queries & Mutations
  const { data, isLoading, isError } = useUsers(filters);
  const deleteMutation = useDeleteUser();

  const users = data?.data || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  };

  const handleDeactivate = useCallback((user) => {
    setDeleteTarget(user);
  }, []);

  const confirmDeactivate = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error("Deactivate failed:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  // Role options with "All" prepended
  const roleFilterOptions = [
    { value: "ALL", label: "Tất cả vai trò" },
    ...ROLE_OPTIONS,
  ];

  // Unit options with "All" prepended
  const unitFilterOptions = [
    { value: "", label: "Tất cả đơn vị" },
    ...MOCK_UNITS.map((u) => ({ value: String(u.id), label: u.name })),
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 motion-reduce:animate-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-foreground"
            style={{ textWrap: "balance" }}
          >
            Quản lý Người dùng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý tài khoản, vai trò và quyền truy cập hệ thống.
          </p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
          asChild
        >
          <Link to="/users/new">
            <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Thêm người
            dùng mới
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border-border shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              name="search"
              autoComplete="off"
              placeholder="Tìm theo tên hoặc email…"
              aria-label="Tìm kiếm người dùng"
              className="pl-10 bg-background border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Lọc theo vai trò"
          >
            {roleFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Unit filter */}
          <select
            value={unitFilter}
            onChange={(e) => {
              setUnitFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Lọc theo đơn vị"
          >
            {unitFilterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-surface/50">
                <TableHead className="font-semibold min-w-[200px]">
                  Người dùng
                </TableHead>
                <TableHead className="font-semibold">Vai trò</TableHead>
                <TableHead className="font-semibold">Đơn vị</TableHead>
                <TableHead className="font-semibold text-center">
                  Đề tài
                </TableHead>
                <TableHead className="font-semibold">Trạng thái</TableHead>
                <TableHead className="font-semibold text-right">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <LoadingState message="Đang tải danh sách người dùng…" />
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      icon={AlertTriangle}
                      title="Không thể tải dữ liệu"
                      description="Đã xảy ra lỗi khi tải danh sách người dùng. Vui lòng thử lại."
                    />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState
                      icon={Users}
                      title="Không tìm thấy người dùng nào"
                      description={
                        searchQuery || roleFilter !== "ALL" || unitFilter
                          ? "Không có kết quả khớp với bộ lọc hiện tại."
                          : "Hệ thống chưa có người dùng nào. Thêm người dùng mới để bắt đầu."
                      }
                      actionLabel="Thêm người dùng"
                      onAction={() => navigate("/users/new")}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    onDeactivate={handleDeactivate}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <Pagination pagination={pagination} onPageChange={setPage} />
      </Card>

      {/* ConfirmDialog for Deactivate */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDeactivate}
        title="Vô hiệu hóa tài khoản?"
        description={
          deleteTarget
            ? `Bạn có chắc chắn muốn vô hiệu hóa tài khoản của "${deleteTarget.fullName}" (${deleteTarget.email})? Hành động này sẽ đánh dấu tài khoản là không hoạt động (Soft Delete theo Điều 1.2a QĐ543). Người dùng sẽ không thể đăng nhập cho đến khi được kích hoạt lại.`
            : ""
        }
        confirmLabel="Vô hiệu hóa"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
