import { axiosClient } from "@/services/api/axiosClient";

/**
 * Tải file từ một `downloadUrl` do BE trả về (`Document.StorageUrl`), **có kèm token**.
 *
 * <p>Vì sao không dùng thẳng `<a href={downloadUrl}>`: mọi endpoint tải file đều có
 * `[Authorize]`, mà token thì nằm trong `localStorage` chứ không phải cookie — thẻ `<a>` không
 * gửi header `Authorization` nên luôn ăn 401. Ở chế độ `npm run dev` còn hỏng sớm hơn: đường dẫn
 * tương đối `/api/...` trỏ vào `localhost:5173` (máy chủ Vite), không phải BE, nên ra thẳng 404.</p>
 *
 * <p>Đúng lỗi Dũng báo 18/08: hồ sơ nghiệm thu *"bấm vào cũng không xem được"*.</p>
 */

/** BE trả đường dẫn đã gồm tiền tố `/api`, còn `axiosClient` đã có sẵn trong `baseURL`. */
function toApiPath(downloadUrl: string): string {
  return downloadUrl.replace(/^\/api(?=\/)/, "");
}

export function fetchFileBlob(downloadUrl: string): Promise<Blob> {
  return axiosClient
    .get<Blob>(toApiPath(downloadUrl), { responseType: "blob" })
    .then((res) => res.data);
}

/** Mở file ở tab mới. Trình duyệt tự quyết xem trước (PDF/ảnh) hay tải xuống. */
export async function openFileInNewTab(downloadUrl: string): Promise<void> {
  const blob = await fetchFileBlob(downloadUrl);
  window.open(URL.createObjectURL(blob), "_blank", "noopener");
}

/** Tải hẳn về máy, giữ đúng tên file BE trả về. */
export async function saveFile(downloadUrl: string, fileName: string): Promise<void> {
  const blob = await fetchFileBlob(downloadUrl);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
