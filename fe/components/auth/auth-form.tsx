"use client";

import { useState, FormEvent } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { KeyRound, UserPlus, LogIn } from "lucide-react";

type AuthMode = "login" | "register";

export default function AuthForm() {
  const { user, isLoggedIn, login, hasHydrated } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!hasHydrated) return null;

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error("Vui lòng nhập đầy đủ username và password.");
      return;
    }

    setIsAuthenticating(true);

    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const payload = await response.json();
      if (!response.ok) {
        toast.error(payload.message || "Xác thực thất bại.");
        return;
      }

      login({
        token: payload.accessToken,
        username: payload.username,
        role: payload.role,
      });

      setUsername("");
      setPassword("");
      toast.success(authMode === "login" ? "Đăng nhập thành công!" : "Đăng ký thành công!");
    } catch {
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setIsAuthenticating(false);
    }
  }

  if (isLoggedIn) {
     return (
        <Card className="overflow-hidden border-2 border-emerald-500/10">
           <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                 <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <LogIn className="h-6 w-6" />
                 </div>
                 <div>
                    <p className="text-sm font-medium text-muted-foreground leading-none mb-1">Đã đăng nhập</p>
                    <h3 className="font-bold text-lg">{user?.username}</h3>
                 </div>
              </div>
           </CardContent>
        </Card>
     );
  }

  return (
    <Card className="overflow-hidden border-2 border-primary/5 shadow-xl shadow-primary/5">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center mb-1">
           <CardTitle className="text-xl">Tài khoản</CardTitle>
           <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-5 px-1.5 opacity-50">Guest enabled</Badge>
        </div>
        <CardDescription>Đăng nhập để nhận ưu đãi từ voucher.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 mb-4">
          <Button
            variant={authMode === "login" ? "default" : "ghost"}
            size="sm"
            onClick={() => setAuthMode("login")}
            className="rounded-md"
          >
            Đăng nhập
          </Button>
          <Button
            variant={authMode === "register" ? "default" : "ghost"}
            size="sm"
            onClick={() => setAuthMode("register")}
            className="rounded-md"
          >
             Đăng ký
          </Button>
        </div>

        <form onSubmit={handleAuthSubmit} className="space-y-3">
          <div className="relative group">
            <UserPlus className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tên đăng nhập"
              className="pl-9 rounded-xl border-2 border-muted focus-visible:ring-primary h-10"
              autoComplete="username"
            />
          </div>
          <div className="relative group">
            <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              type="password"
              className="pl-9 rounded-xl border-2 border-muted focus-visible:ring-primary h-10"
              autoComplete={authMode === "login" ? "current-password" : "new-password"}
            />
          </div>
          <Button
            type="submit"
            className="w-full h-10 font-bold rounded-xl"
            disabled={isAuthenticating}
          >
            {isAuthenticating ? "Đang xử lý..." : authMode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
