"use client";

import Link from 'next/link';
import LoginForm from './_components/login-form';
import { Coffee, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 sm:px-8">
      {/* Nền động động và pattern hình tam giác/vẽ tia */}
      <div className="fixed inset-0 pattern-burst opacity-40 pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-br from-paper/30 via-paper-strong/10 to-transparent pointer-events-none" />
      
      {/* Nút Quay lại */}
      <div className="absolute top-6 left-6 z-10 sm:top-10 sm:left-10">
        <Link href="/">
          <Button variant="ghost" size="sm" className="rounded-full gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline font-medium">Trở về trang chủ</span>
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10 fade-up">
        {/* Logo và Tiêu đề lớn */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 mb-5 relative group">
            <div className="absolute inset-0 bg-primary rounded-2xl animate-pulse opacity-40" />
            <Coffee className="h-8 w-8 relative z-10 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <h1 className="text-3xl font-display font-black tracking-tighter text-ink mb-1">
            Mini<span className="text-primary italic">Order</span>Sys
          </h1>
          <p className="text-sm font-medium text-ink-soft/80">Hệ thống đặt món thông minh & tiện lợi</p>
        </div>

        {/* Component Form Đăng nhập */}
        <LoginForm />

        {/* Footer trang */}
        <div className="mt-8 text-center">
          <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-widest leading-loose">
            © 2026 MiniOrderSys · Mọi quyền được bảo lưu
          </p>
        </div>
      </div>
    </main>
  );
}
