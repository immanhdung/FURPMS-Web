import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const handleLogin = (e) => {
    e.preventDefault();

    alert("Login Success");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            FURPMS Login
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                Username
              </label>

              <Input
                type="text"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Password
              </label>

              <Input
                type="password"
                placeholder="Enter password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}