import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLoginMutation } from "@/hooks/useAuth";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/login.schema";

export function LoginPage() {
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

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
    <Card className="border border-white/20 bg-white/10 py-0 shadow-soft-xl backdrop-blur-xl">
      <CardContent className="p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-brand-secondary shadow-soft-md">
            <span className="text-xl font-bold text-white">F</span>
          </div>
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                disabled={loginMutation.isPending}
                className="border-white/20 bg-white/10 pr-9 text-white placeholder:text-slate-400"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
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
                  className="border-white/30 data-[state=checked]:border-primary data-[state=checked]:bg-primary"
                />
                Keep me signed in
              </label>
            )}
          />

          <Button
            type="submit"
            variant="gradient"
            disabled={loginMutation.isPending}
            className="w-full"
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
