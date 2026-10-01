import { Fragment } from "react";

/**
 * Hiển thị văn bản AI viết (Gemini) — chỉ hiểu đúng 2 thứ mô hình hay dùng: `**đậm**` và dòng bắt
 * đầu bằng `*` / `-` là gạch đầu dòng. Trước 01/10 in nguyên văn nên người xem thấy cả đống dấu `**`.
 * Cố ý KHÔNG dùng thư viện markdown/HTML: văn bản này do máy sinh, không được để nó chèn thẻ.
 */
export function LiteMarkdown({ text, className }: { text: string; className?: string }) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  return (
    <div className={className}>
      {lines.map((raw, i) => {
        const bullet = /^\s*[*-]\s+/.test(raw);
        const line = bullet ? raw.replace(/^\s*[*-]\s+/, "") : raw;
        if (!line.trim()) return <div key={i} className="h-2" />;
        const parts = line.split(/\*\*(.+?)\*\*/g);
        const content = parts.map((p, j) => (j % 2 === 1 ? <strong key={j}>{p}</strong> : <Fragment key={j}>{p}</Fragment>));
        return bullet ? (
          <p key={i} className="flex gap-1.5 pl-2">
            <span aria-hidden>•</span>
            <span>{content}</span>
          </p>
        ) : (
          <p key={i}>{content}</p>
        );
      })}
    </div>
  );
}
