import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLoginMutation } from "@/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/login.schema";

export function LoginPage() {
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const onSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };

  return (
    <Card className="border border-white/20 bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <CardContent className="p-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">FURPMS</h1>
          <p className="mt-2 text-slate-300">Research Project Management System</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-slate-200">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              disabled={loginMutation.isPending}
              className="border-white/20 bg-white/10 text-white placeholder:text-slate-400"
              {...register("email")}
            />
            {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-slate-200">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              disabled={loginMutation.isPending}
              className="border-white/20 bg-white/10 text-white placeholder:text-slate-400"
              {...register("password")}
            />
            {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <Controller
            control={control}
            name="rememberMe"
            render={({ field }) => (
              <label className="flex select-none items-center gap-2 text-sm text-slate-300">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  disabled={loginMutation.isPending}
                  className="border-white/30 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500"
                />
                Keep me signed in
              </label>
            )}
          />

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-linear-to-r from-blue-500 to-purple-600 text-white hover:opacity-90"
          >
            {loginMutation.isPending && <Loader2 className="animate-spin" />}
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          FPT University Research Project Management System
        </div>
      </CardContent>
    </Card>
  );
}
