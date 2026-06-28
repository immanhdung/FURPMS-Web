import React, { useState, useRef, useId, useCallback } from "react";
import { UploadCloud, X, File, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn, formatNumber } from "../../lib/utils";

/**
 * FileUploader — Accessible Drag & Drop file uploader
 */
export function FileUploader({
  label,
  description,
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  maxFiles = 5,
  multiple = false,
  error: externalError,
  required,
  className,
  id: externalId,
  value = [], // Array of file objects: { file, status, error, url, name, size }
  onChange,
  onRemove,
}) {
  const generatedId = useId();
  const id = externalId || generatedId;
  const inputRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState(null);

  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  
  const activeError = externalError || localError;

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file) => {
    if (maxSize && file.size > maxSize) {
      return `File ${file.name} vượt quá dung lượng tối đa (${formatNumber(maxSize / (1024 * 1024))}MB)`;
    }
    // Very basic accept check (can be improved)
    if (accept) {
      const allowedTypes = accept.split(",").map(t => t.trim().toLowerCase());
      const fileExt = `.${file.name.split(".").pop().toLowerCase()}`;
      const fileType = file.type.toLowerCase();
      
      const isAllowed = allowedTypes.some(type => {
        if (type.startsWith(".")) return type === fileExt;
        if (type.endsWith("/*")) return fileType.startsWith(type.replace("/*", ""));
        return type === fileType;
      });
      
      if (!isAllowed) {
        return `Loại file ${fileExt} không được hỗ trợ.`;
      }
    }
    return null;
  };

  const processFiles = (filesList) => {
    setLocalError(null);
    
    if (!multiple && filesList.length > 1) {
      setLocalError("Chỉ được phép tải lên 1 file.");
      return;
    }
    
    if (multiple && value.length + filesList.length > maxFiles) {
      setLocalError(`Chỉ được phép tải lên tối đa ${maxFiles} file.`);
      return;
    }

    const validFiles = [];
    
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const error = validateFile(file);
      
      if (error) {
        setLocalError(error);
        if (!multiple) return; // Stop if single file upload fails
        continue;
      }
      
      validFiles.push({
        file,
        name: file.name,
        size: file.size,
        status: "PENDING", // PENDING, UPLOADING, SUCCESS, ERROR
      });
    }

    if (validFiles.length > 0 && onChange) {
      const newValue = multiple ? [...value, ...validFiles] : validFiles;
      onChange(newValue);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [multiple, value, maxFiles, accept, maxSize, onChange]);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input so same file can be selected again if removed
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <div className="flex justify-between items-end">
          <label 
            htmlFor={id} 
            className="text-sm font-medium text-foreground"
          >
            {label}
            {required && <span className="text-destructive ml-1" aria-hidden="true">*</span>}
          </label>
          
          {multiple && maxFiles > 1 && (
            <span className="text-xs text-muted-foreground">
              {value.length}/{maxFiles} files
            </span>
          )}
        </div>
      )}
      
      {/* Drop Zone */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          activeError && "border-destructive/50 bg-destructive/5 hover:border-destructive"
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-invalid={!!activeError}
        aria-describedby={cn(activeError && errorId, description && helpId)}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="sr-only"
          aria-hidden="true"
        />
        
        <div className="flex flex-col items-center justify-center space-y-2 text-center pointer-events-none">
          <div className="p-3 bg-muted rounded-full text-muted-foreground">
            <UploadCloud size={24} />
          </div>
          <div className="text-sm font-medium text-foreground">
            <span className="text-primary hover:underline cursor-pointer">Nhấp để tải lên</span>
            {" "}hoặc kéo thả file vào đây
          </div>
          <p className="text-xs text-muted-foreground">
            {accept ? `Hỗ trợ: ${accept.split(",").join(", ")}` : "Hỗ trợ mọi loại file"}
            {" • "}Tối đa {formatNumber(maxSize / (1024 * 1024))}MB
          </p>
        </div>
      </div>
      
      {/* Description / Help text */}
      {description && !activeError && (
        <p id={helpId} className="text-[0.8rem] text-muted-foreground">
          {description}
        </p>
      )}
      
      {/* Error Message */}
      {activeError && (
        <p id={errorId} className="text-[0.8rem] font-medium text-destructive flex items-center gap-1" role="alert">
          <AlertCircle size={14} />
          {activeError}
        </p>
      )}

      {/* File List */}
      {value.length > 0 && (
        <ul className="mt-3 space-y-2" aria-label="Danh sách file đã chọn">
          {value.map((item, index) => (
            <li 
              key={index} 
              className={cn(
                "flex items-center justify-between p-3 bg-card border rounded-md shadow-sm text-sm",
                item.status === "ERROR" ? "border-destructive/50 bg-destructive/5" : "border-border"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={cn(
                  "p-2 rounded-md shrink-0",
                  item.status === "SUCCESS" ? "bg-green-100 text-green-600" :
                  item.status === "ERROR" ? "bg-red-100 text-red-600" :
                  "bg-muted text-muted-foreground"
                )}>
                  {item.status === "SUCCESS" ? <CheckCircle2 size={16} /> : 
                   item.status === "ERROR" ? <AlertCircle size={16} /> : 
                   <File size={16} />}
                </div>
                
                <div className="flex flex-col overflow-hidden">
                  <span className="font-medium truncate text-foreground" title={item.name}>
                    {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(item.size)}
                  </span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove && onRemove(index);
                }}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Xóa file ${item.name}`}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
