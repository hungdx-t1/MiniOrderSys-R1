"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[80dvh] items-center justify-center p-4">
      <Card className="max-w-md w-full border-none shadow-2xl bg-white/50 backdrop-blur-md rounded-[2.5rem] overflow-hidden">
        <div className="h-2 bg-rose-500 w-full" />
        
        <CardHeader className="text-center pt-10 pb-4">
          <div className="mx-auto h-20 w-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-inner mb-6 animate-pulse">
            <AlertCircle className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">
            Ối! Đã có lỗi xảy ra
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium px-4 mt-2 leading-relaxed">
            Hệ thống gặp sự cố ngoài ý muốn. Đừng lo lắng, dữ liệu của bạn vẫn an toàn. Hãy thử tải lại trang hoặc quay về trang chủ.
          </CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-4">
          {process.env.NODE_ENV === "development" && (
            <div className="p-4 bg-slate-900 rounded-2xl text-[11px] font-mono text-rose-300 overflow-auto max-h-40 border border-slate-800">
              <p className="font-bold mb-1 uppercase tracking-widest text-slate-500">Debug Info:</p>
              {error.message || "Unknown error"}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 p-8 pt-4">
          <Button 
            variant="default" 
            size="lg" 
            className="w-full h-14 rounded-2xl font-black text-base gap-3 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={reset}
          >
            <RefreshCcw className="h-5 w-5" />
            Thử lại ngay
          </Button>
          
          <Link href="/" className="w-full">
            <Button 
              variant="ghost" 
              size="lg" 
              className="w-full h-14 rounded-2xl font-bold text-slate-500 hover:bg-slate-100/80 transition-all"
            >
              <Home className="mr-2 h-5 w-5" />
              Quay về Trang chủ
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
