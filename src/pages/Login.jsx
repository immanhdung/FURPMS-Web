import React, { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Key, KeyRound, LogIn as LoginIcon, Loader2 } from "lucide-react";
import { api } from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const setAuthToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleTokenLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // POST /api/v1/auth/invitation/verify
      const res = await api.post("/auth/invitation/verify", { token });
      if (res.data.success) {
        setAuthToken(res.data.data.token);
        setUser(res.data.data.user);
        navigate("/dashboard");
      } else {
        setError(res.data.message || "Invalid token");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSSOLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Typically redirects to an SSO provider, for mock purposes we'll simulate a login directly
      const res = await api.post("/auth/login", { email: "user@fpt.edu.vn" });
      if (res.data.success) {
        setAuthToken(res.data.data.token);
        setUser(res.data.data.user);
        navigate("/dashboard");
      } else {
        setError(res.data.message || "SSO Login failed");
      }
    } catch (err) {
      console.error("SSO Login failed:", err);
      setError(err.response?.data?.message || "SSO Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Left Pane - Branding */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 sm:p-10 relative z-10 text-center md:text-left bg-gradient-to-br from-tertiary-container/30 to-primary-container/20 overflow-hidden">
        <div className="max-w-md w-full relative z-20 flex flex-col gap-6">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary tracking-tight" style={{ textWrap: "balance" }}>FURPMS</h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-secondary-foreground" style={{ textWrap: "balance" }}>
            FPT University Research Project Management System
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mt-4 sm:mt-6 border-l-4 border-primary pl-4">
            Empowering academic excellence and research innovation.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none z-0 motion-reduce:hidden" aria-hidden="true" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-tertiary/10 rounded-full blur-3xl pointer-events-none z-0 motion-reduce:hidden" aria-hidden="true" />
      </div>

      {/* Right Pane - Login Container */}
      <div className="w-full md:w-1/2 bg-surface flex items-center justify-center p-6 sm:p-10 relative z-20">
        <div className="w-full max-w-md bg-card/80 backdrop-blur-md border border-border rounded-xl shadow-md p-6 sm:p-10 flex flex-col gap-6 sm:gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-semibold text-card-foreground mb-2" style={{ textWrap: "balance" }}>Welcome Back</h2>
            <p className="text-sm text-muted-foreground">Please sign in to your account</p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm" role="alert" aria-live="polite">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-6">
            <Button
              onClick={handleSSOLogin}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-lg text-lg flex items-center gap-3 transition-colors transition-shadow"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Đang xác thực…</>
              ) : (
                <><LoginIcon className="w-5 h-5" aria-hidden="true" /> Login with FPT SSO</>
              )}
            </Button>
          </div>

          <div className="relative flex items-center my-2">
            <div className="flex-grow border-t border-border" aria-hidden="true" />
            <span className="flex-shrink-0 mx-4 text-xs font-semibold tracking-widest text-outline uppercase bg-card px-2 rounded">
              Or for External Experts
            </span>
            <div className="flex-grow border-t border-border" aria-hidden="true" />
          </div>

          <form onSubmit={handleTokenLogin} className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground mb-2">
              Invited experts, please enter your secure token below.
            </p>
            <div className="flex flex-col gap-2">
              <label htmlFor="invite-token" className="text-xs font-semibold text-muted-foreground uppercase">
                Invitation Token
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="invite-token"
                  type="text"
                  name="invitation-token"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="Enter your 32-character token…"
                  className="pl-10 py-6 border-border focus-visible:ring-primary focus-visible:border-primary bg-background rounded-lg text-sm"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              variant="outline"
              className="w-full mt-2 border-primary text-primary hover:bg-primary/10 hover:text-primary py-6 rounded-lg text-lg flex items-center gap-3 transition-colors transition-shadow"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" aria-hidden="true" /> Đang xác thực…</>
              ) : (
                <><KeyRound className="w-5 h-5" aria-hidden="true" /> Authenticate</>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
