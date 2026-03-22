"use client";

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { KeyRound, User, LogIn, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { cn, extractErrorMessage } from '@/lib/utils';

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin đăng nhập.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = extractErrorMessage(data, 'Tên đăng nhập hoặc mật khẩu không đúng.');
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      login({
        username: data.username,
        role: data.role,
        token: data.accessToken,
      });

      toast.success('Chào mừng trở lại, ' + data.username + '!');
      
      if (data.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      toast.error('Lỗi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="glass-card w-full border-none shadow-2xl relative overflow-hidden group">
      {/* Hiệu ứng trang trí */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-mint/10 rounded-full blur-3xl group-hover:bg-mint/20 transition-colors duration-500" />

      <CardHeader className="space-y-1 pt-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <LogIn className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl font-display font-bold text-center tracking-tight">Chào mừng trở lại</CardTitle>
        <CardDescription className="text-center text-muted-foreground/80">
          Nhập thông tin của bạn để tiếp tục trải nghiệm
        </CardDescription>
      </CardHeader>
      
      <CardContent className="grid gap-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">
              Tên đăng nhập
            </Label>
            <div className="relative group/input">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
              <Input
                id="username"
                type="text"
                placeholder="admin / user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 h-11 rounded-xl border-border-soft bg-background/50 focus-visible:ring-primary focus-visible:bg-background transition-all"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Mật khẩu
              </Label>
              <Link href="#" className="text-xs font-medium text-primary hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative group/input">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "pl-10 h-11 rounded-xl border-border-soft bg-background/50 focus-visible:ring-primary focus-visible:bg-background transition-all",
                  error && "border-destructive/50 bg-destructive/5"
                )}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold animate-in fade-in zoom-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 group/btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Đăng nhập
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-4 pb-8">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border-soft" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground font-medium">Hoặc</span>
          </div>
        </div>
        
        <p className="text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="text-primary font-bold hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
