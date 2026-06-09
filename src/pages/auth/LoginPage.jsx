import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">
      {/* Background blobs */}
      <div className="absolute -top-40 left-0 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />

      <div className="absolute top-1/2 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/20 blur-3xl" />

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
        <CardContent className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-white">
              FURPMS
            </h1>

            <p className="mt-2 text-slate-300">
              Research Project Management System
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm text-slate-200">
                Username
              </label>

              <Input
                placeholder="Enter username"
                className="border-white/20 bg-white/10 text-white placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-200">
                Password
              </label>

              <Input
                type="password"
                placeholder="Enter password"
                className="border-white/20 bg-white/10 text-white placeholder:text-slate-400"
              />
            </div>

            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            FPT University Research Project Management System
          </div>
        </CardContent>
      </Card>
    </div>
  );
}