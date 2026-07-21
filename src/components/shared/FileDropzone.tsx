import { useRef, useState, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Upload, X } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_ACCEPT = ".pdf,.doc,.docx";
const DEFAULT_MAX_SIZE_MB = 20;

interface FileDropzoneProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  accept?: string;
  maxSizeMb?: number;
  disabled?: boolean;
  label?: string;
  hint?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropzone({
  file,
  onFileSelect,
  onRemove,
  accept = DEFAULT_ACCEPT,
  maxSizeMb = DEFAULT_MAX_SIZE_MB,
  disabled = false,
  label,
  hint,
}: FileDropzoneProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSelect = (candidate: File) => {
    const allowedExtensions = accept.split(",").map((ext) => ext.trim().toLowerCase());
    const extension = `.${candidate.name.split(".").pop()?.toLowerCase()}`;
    if (!allowedExtensions.includes(extension)) {
      setError(t("common.unsupportedType", { accept }));
      return;
    }
    if (candidate.size > maxSizeMb * 1024 * 1024) {
      setError(t("common.fileTooLarge", { max: maxSizeMb }));
      return;
    }
    setError(null);
    onFileSelect(candidate);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) validateAndSelect(dropped);
  };

  if (file) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
        </div>
        {!disabled && (
          <Button type="button" variant="ghost" size="icon-sm" aria-label={t("common.removeFile")} onClick={onRemove}>
            <X />
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          isDragging ? "border-primary bg-primary/4" : "border-border hover:border-primary/40",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <Upload className="size-4.5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">{label ?? t("common.dropzoneLabel")}</p>
        <p className="text-xs text-muted-foreground">{hint ?? t("common.dropzoneHint")}</p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) validateAndSelect(selected);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>
  );
}
