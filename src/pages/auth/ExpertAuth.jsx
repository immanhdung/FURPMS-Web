import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { api } from "../../api/axios";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function ExpertAuth() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    if (!token) {
      toast.error("Link xác thực không hợp lệ hoặc đã hết hạn.");
      navigate("/login");
      return;
    }

    const authenticateExpert = async () => {
      try {
        // Here we'd call the real API: await api.post("/auth/expert-login", { token })
        // For mock purposes, we will simulate a successful login response directly
        // since setting up a specific mock for this requires changing setupMocks again, 
        // we can just mock the resolution here. In a real app, it calls the backend.
        
        // Mock API Call
        const { data } = await api.post("/auth/login", { email: "expert@mock.com" }); // fallback login for mock
        
        // Custom override for expert
        const expertUser = {
          id: "expert-" + Date.now(),
          email: "expert@mock.com",
          fullName: "Chuyên gia Khách mời",
          roles: ["Reviewer"],
          isExternal: true
        };

        setAuth({
          user: expertUser,
          token: token,
          refreshToken: "dummy-refresh"
        });

        toast.success("Xác thực chuyên gia thành công!");
        
        // Find if there is a specific invitation ID to redirect to, 
        // usually it's in the token or as another param, for now redirect to councils list
        // Alternatively, the link could be /expert-login?token=abc&redirect=/invitations/123
        const redirectPath = searchParams.get("redirect") || "/meetings";
        navigate(redirectPath);
      } catch (err) {
        toast.error("Lỗi khi xác thực. Vui lòng thử lại hoặc liên hệ quản trị viên.");
        navigate("/login");
      }
    };

    // Small delay to show the loading screen beautifully
    const timeout = setTimeout(() => {
      authenticateExpert();
    }, 1500);

    return () => clearTimeout(timeout);
  }, [token, navigate, setAuth, searchParams]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-6">
        {/* FPT Logo placeholder */}
        <div className="w-24 h-10 bg-[#F26F21] rounded-md flex items-center justify-center text-white font-bold text-xl mb-4">
          FPT
        </div>
        
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Xác thực Chuyên gia</h1>
          <p className="text-sm text-muted-foreground">
            Hệ thống đang kiểm tra phiên làm việc an toàn của bạn...
          </p>
        </div>

        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    </div>
  );
}
