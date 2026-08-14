import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { CommandPalette } from "@/components/command/CommandPalette";
import { DevClockWidget } from "@/components/shared/DevClockWidget";

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="relative flex h-screen w-full overflow-hidden">
      {/* Nền aurora — để TĨNH (không animate vô hạn). Mỗi orb có filter: blur(64px); nếu animate
          liên tục (nhất là scale) trình duyệt phải vẽ lại blur MỖI KHUNG HÌNH trên mọi trang → lag.
          Tĩnh thì blur chỉ raster 1 lần rồi cache; nhìn gần như y hệt vì orb vốn nhích rất chậm. */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="aurora-orb -top-32 -left-24 h-104 w-104 bg-primary/25" />
        <div className="aurora-orb top-1/4 -right-40 h-120 w-120 bg-brand-secondary/20" />
        <div className="aurora-orb -bottom-32 left-1/4 h-104 w-104 bg-brand-accent-2/18" />
        <div className="aurora-orb right-1/4 bottom-0 h-80 w-80 bg-brand-accent/16" />
      </div>

      <Sidebar />

      {/* min-w-0 BẮT BUỘC: flex item mặc định có min-width:auto nên cột này không co được
          dưới bề rộng nội dung ⇒ ở màn hẹp (sidebar vẫn hiện từ md) nội dung bị đẩy tràn
          ra ngoài, breadcrumb xuống 3 dòng, chữ lòi khỏi khung. */}
      <div className="relative z-10 flex h-screen min-w-0 flex-1 flex-col overflow-y-auto">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette />
      {/* Công cụ tua thời gian để test các mốc hạn dài ngày. Tự ẩn với người không phải Admin,
          và BE chặn cứng trên production. */}
      <DevClockWidget />
    </div>
  );
}
