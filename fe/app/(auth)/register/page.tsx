"use client";

import Link from 'next/link';
import RegisterForm from './_components/register-form';
import { Coffee, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 sm:px-8">
      {/* Nền động và pattern */}
      <div className="fixed inset-0 pattern-burst opacity-40 pointer-events-none transform -scale-x-100" />
      <div className="fixed inset-0 bg-gradient-to-bl from-mint/10 via-paper-strong/10 to-transparent pointer-events-none" />
      
      {/* Nút Quay lại */}
      <div className="absolute top-6 left-6 z-10 sm:top-10 sm:left-10">
        <Link href="/">
          <Button variant="ghost" size="sm" className="rounded-full gap-2 text-ink-soft hover:text-ink">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline font-medium text-xs uppercase tracking-widest font-bold">Thoát</span>
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md relative z-10 fade-up">
        {/* Header với Icon Bảo mật */}
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center gap-4 px-2">
          <div className="h-14 w-14 shrink-0 items-center justify-center flex rounded-2xl bg-mint/10 text-mint border-2 border-mint/20 shadow-xl shadow-mint/5 group">
            <ShieldCheck className="h-8 w-8 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-black tracking-tight text-ink mb-0.5">
              Khởi tạo hành trình đặt món
            </h1>
            <p className="text-xs font-bold text-mint uppercase tracking-widest">
              Giao dịch an toàn & minh bạch
            </p>
          </div>
        </div>

        {/* Component Form Đăng ký */}
        <RegisterForm />

        {/* Lợi ích khi đăng ký */}
        <div className="mt-8 grid grid-cols-2 gap-4 px-2">
          <div className="flex items-start gap-2">
            <div className="mt-1 h-3 w-3 rounded-full bg-mint/60 shrink-0 shadow-lg shadow-mint/10" />
            <p className="text-[10px] font-bold text-ink-soft uppercase leading-tight tracking-tighter">Luôn cập nhật ưu đãi mới nhất</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="mt-1 h-3 w-3 rounded-full bg-primary/60 shrink-0 shadow-lg shadow-primary/10" />
            <p className="text-[10px] font-bold text-ink-soft uppercase leading-tight tracking-tighter">Quản lý lịch sử đặt hàng dễ dàng</p>
          </div>
        </div>

        <div className="mt-10 text-center opacity-40">
           <Link href="/" className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-100">
              <Coffee className="h-4 w-4 text-ink" />
              <span className="text-xs font-black tracking-tighter text-ink">MiniOrderSys</span>
           </Link>
        </div>
      </div>
    </main>
  );
}
