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
import { KeyRound, User, UserPlus, ArrowRight, Loader2, Mail, AlertCircle } from 'lucide-react';
import { cn, extractErrorMessage } from '@/lib/utils';

export default function RegisterForm() {
  const { login } = useAuth();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Xử lý gửi form đăng ký
   * @param event - Sự kiện submit form
   */
  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin đăng ký.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    setIsLoading(true);

    try {
      // Gọi API đăng ký
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = extractErrorMessage(data, 'Đăng ký thất bại. Tên đăng nhập có thể đã tồn tại.');
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Tự động đăng nhập sau khi đăng ký thành công
      login({
        username: data.username,
        role: data.role,
        token: data.accessToken,
      });

      toast.success('Đăng ký thành công! Chào mừng đến với hệ thống.');
      
      // Chuyển hướng
      router.push('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      toast.error('Lỗi kết nối máy chủ.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="glass-card w-full border-none shadow-2xl relative overflow-hidden group">
      {/* Hiệu ứng trang trí mờ phía sau */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-mint/10 rounded-full blur-3xl group-hover:bg-mint/20 transition-colors duration-500" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors duration-500" />

      <CardHeader className="space-y-1 pt-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-mint rounded-2xl shadow-lg shadow-mint/20 -rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl font-display font-bold text-center tracking-tight text-ink">Tạo tài khoản mới</CardTitle>
        <CardDescription className="text-center text-ink-soft/80">
          Gia nhập cộng đồng người dùng của chúng tôi ngay hôm nay
        </CardDescription>
      </CardHeader>
      
      <CardContent className="grid gap-4">
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-ink-soft ml-1">
              Tên đăng nhập
            </Label>
            <div className="relative group/input">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft group-focus-within/input:text-mint transition-colors" />
              <Input
                id="username"
                type="text"
                placeholder="Chọn tên đăng nhập độc nhất"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 h-11 rounded-xl border-border-soft bg-background/50 focus-visible:ring-mint focus-visible:bg-background transition-all"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-ink-soft ml-1">
              Mật khẩu
            </Label>
            <div className="relative group/input">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft group-focus-within/input:text-mint transition-colors" />
              <Input
                id="password"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-11 rounded-xl border-border-soft bg-background/50 focus-visible:ring-mint focus-visible:bg-background transition-all"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-widest text-ink-soft ml-1">
              Xác nhận mật khẩu
            </Label>
            <div className="relative group/input">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft group-focus-within/input:text-mint transition-colors" />
              <Input
                id="confirm-password"
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  "pl-10 h-11 rounded-xl border-border-soft bg-background/50 focus-visible:ring-mint focus-visible:bg-background transition-all",
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
            className="w-full h-11 rounded-xl font-bold bg-mint hover:bg-mint/90 text-white shadow-lg shadow-mint/20 group/btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                Đăng ký ngay
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
            <span className="bg-background px-2 text-ink-soft font-medium">Hoặc</span>
          </div>
        </div>
        
        <p className="text-center text-sm text-ink-soft">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-mint font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
