import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  CalendarRange,
  FileCheck2,
  Gavel,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";
import fptLogo from "@/assets/fpt-logo.png";
import campusHero from "@/assets/campus-hero.jpg";

const FEATURES = [
  {
    icon: CalendarRange,
    title: "Quản lý Chu kỳ Nghiên cứu",
    description: "Thiết lập chu kỳ, lĩnh vực nghiên cứu và thời hạn nộp đề tài một cách minh bạch.",
  },
  {
    icon: FileCheck2,
    title: "Quy trình Phản biện",
    description: "Theo dõi đề xuất từ nộp hồ sơ đến chấm điểm và quyết định cuối cùng theo thời gian thực.",
  },
  {
    icon: Gavel,
    title: "Hội đồng Khoa học",
    description: "Thành lập hội đồng, mời phản biện, quản lý lịch họp và biên bản nghiệm thu.",
  },
  {
    icon: BarChart3,
    title: "Phân tích & Báo cáo",
    description: "Trực quan hóa tiến độ đề tài, ngân sách và hiệu suất hội đồng bằng biểu đồ chuyên sâu.",
  },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-slate-950/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <img src={fptLogo} alt="FPT University" className="h-8 w-auto object-contain" />
            <span className="hidden text-sm font-semibold tracking-wide text-white/90 sm:inline">FURPMS</span>
          </div>
          <Button onClick={() => navigate(ROUTES.LOGIN)} className="bg-linear-to-r from-blue-500 to-purple-600 text-white hover:opacity-90">
            Đăng nhập
            <ArrowRight />
          </Button>
        </div>
      </header>

      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={campusHero} alt="FPT University campus" className="size-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
          <div className="absolute inset-0 bg-linear-to-r from-slate-950/70 via-slate-950/20 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-16 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
              <Sparkles className="size-3.5 text-teal-400" />
              Trường Đại học FPT
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Hệ thống Quản lý
              <br />
              <span className="bg-linear-to-r from-blue-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                Đề tài Nghiên cứu Khoa học
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              FURPMS đồng hành cùng giảng viên, hội đồng khoa học và phòng quản lý nghiên cứu trong toàn bộ vòng đời
              đề tài — từ đề xuất, phản biện, chấm điểm đến nghiệm thu và báo cáo.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => navigate(ROUTES.LOGIN)}
                className="bg-linear-to-r from-blue-500 to-purple-600 text-white hover:opacity-90"
              >
                Đăng nhập hệ thống
                <ArrowRight />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-border bg-background py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Một nền tảng cho toàn bộ quy trình nghiên cứu
            </h2>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Được thiết kế riêng cho quản trị viên, phòng nghiên cứu, giảng viên và hội đồng phản biện.
            </p>
          </motion.div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="size-5" />
                    </div>
                    <p className="mt-4 text-sm font-semibold text-foreground">{feature.title}</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} FPT University. All rights reserved.</p>
          <p>FURPMS · Research Project Management System</p>
        </div>
      </footer>
    </div>
  );
}
