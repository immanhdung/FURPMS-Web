/** Lưu một Blob (file Word/Excel máy chủ trả về) xuống máy người dùng với tên cho trước. */
export function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Thu hồi sau một nhịp — thu hồi ngay thì vài trình duyệt huỷ tải giữa chừng.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
