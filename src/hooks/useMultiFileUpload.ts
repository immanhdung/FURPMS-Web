import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useUploadPolicyQuery } from "@/hooks/useSystemSettings";

interface Options {
  /** Tải LÊN một tệp. Trả promise; ném lỗi nếu hỏng. */
  upload: (file: File) => Promise<unknown>;
}

interface Result {
  /** Nhận `FileList` từ input rồi tự lọc, tải tuần tự, báo kết quả gộp. */
  handleFiles: (files: FileList | null) => Promise<void>;
  /** Đang tải tệp thứ mấy trên tổng bao nhiêu — để nút hiện "2/5" thay vì chỉ quay vòng. */
  progress: { done: number; total: number } | null;
  isUploading: boolean;
}

/**
 * Chọn NHIỀU tệp một lượt.
 *
 * Trước đây mọi ô chọn tệp đều một-tệp-một-lần: chủ nhiệm nộp thuyết minh + lý lịch khoa học +
 * phụ lục là phải mở hộp thoại ba lần, Phòng QLKH upload xấp chứng từ giải ngân thì lặp cả chục
 * lần. Đây là chỗ mất thời gian nhất khi demo mà không có gì khó về kỹ thuật.
 *
 * Tải **tuần tự** chứ không song song: máy chủ lưu qua Cloudinary, bắn mười yêu cầu cùng lúc vừa
 * dễ chạm giới hạn vừa làm mất dấu tệp nào hỏng. Tuần tự thì báo được đúng tên tệp lỗi.
 *
 * Lọc dung lượng/định dạng **ngay trên trình duyệt** theo cấu hình hệ thống — tệp sai không cần
 * gửi đi rồi chờ 400 quay về; những tệp hợp lệ còn lại vẫn tải bình thường.
 */
export function useMultiFileUpload({ upload }: Options): Result {
  const { t } = useTranslation();
  const { data: policy } = useUploadPolicyQuery();
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const maxMb = policy?.maxFileSizeMb ?? 10;
  const allowed = policy?.allowedExtensions ?? [];

  const reject = (file: File): string | null => {
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : "";
    if (allowed.length > 0 && !allowed.includes(ext)) {
      return t("common.unsupportedType", { accept: allowed.join(", ") });
    }
    if (file.size > maxMb * 1024 * 1024) return t("common.fileTooLarge", { max: maxMb });
    return null;
  };

  const handleFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;

    const accepted: File[] = [];
    const rejected: string[] = [];
    for (const file of files) {
      const reason = reject(file);
      if (reason) rejected.push(`${file.name}: ${reason}`);
      else accepted.push(file);
    }

    // Nêu ĐÍCH DANH tệp nào bị loại và vì sao — "có tệp không hợp lệ" thì người dùng phải tự mò.
    if (rejected.length > 0) {
      toast.error(t("common.filesRejected", { count: rejected.length }), {
        description: rejected.join("\n"),
      });
    }
    if (accepted.length === 0) return;

    setProgress({ done: 0, total: accepted.length });
    const failed: string[] = [];
    let succeeded = 0;

    for (const file of accepted) {
      try {
        await upload(file);
        succeeded += 1;
      } catch {
        failed.push(file.name);
      }
      setProgress({ done: succeeded + failed.length, total: accepted.length });
    }

    setProgress(null);

    if (failed.length > 0) {
      toast.error(t("common.uploadPartial", { done: succeeded, total: accepted.length }), {
        description: failed.join(", "),
      });
    } else if (succeeded > 1) {
      // Một tệp thì mutation đã tự toast rồi, không báo chồng.
      toast.success(t("common.uploadAllDone", { count: succeeded }));
    }
  };

  return { handleFiles, progress, isUploading: progress !== null };
}
