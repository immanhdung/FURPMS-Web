import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { api } from "../../api/axios";

/**
 * SSO Callback Page
 * Handles the OAuth2 redirect from FPT SSO.
 * Reads the `code` param from URL → POST /auth/sso/callback → store tokens → redirect.
 * API Contract §3: /api/v1/auth/sso/callback
 */
export default function SSOCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [status, setStatus] = useState("processing"); // processing | success | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setStatus("error");
      setErrorMessage("Không tìm thấy mã xác thực (code) trong URL.");
      return;
    }

    async function handleCallback() {
      try {
        const { data } = await api.post("/auth/sso/callback", {
          code,
          redirectUri: `${window.location.origin}/auth/callback`,
        });

        if (data.success && data.data) {
          setAuth({
            user: data.data.user,
            token: data.data.accessToken,
            refreshToken: data.data.refreshToken,
          });
          setStatus("success");
          // Short delay to show success before redirect
          setTimeout(() => navigate("/dashboard", { replace: true }), 500);
        } else {
          throw new Error(data.message || "Xác thực SSO thất bại.");
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(
          err.response?.data?.message || err.message || "Đã xảy ra lỗi khi xác thực SSO."
        );
      }
    }

    handleCallback();
  }, [searchParams, setAuth, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-lg text-center">
        {status === "processing" && (
          <>
            <div
              className="mx-auto mb-4 w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin"
              role="status"
              aria-label="Đang xử lý đăng nhập"
            />
            <h1 className="text-xl font-semibold text-foreground mb-2">
              Đang xác thực...
            </h1>
            <p className="text-sm text-muted-foreground">
              Vui lòng đợi trong giây lát.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground mb-2">
              Đăng nhập thành công!
            </h1>
            <p className="text-sm text-muted-foreground">
              Đang chuyển hướng đến Dashboard...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground mb-2">
              Xác thực thất bại
            </h1>
            <p className="text-sm text-destructive mb-4" role="alert">
              {errorMessage}
            </p>
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Quay lại đăng nhập
            </a>
          </>
        )}
      </div>
    </div>
  );
}
