"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PaymentLoading } from "./payment-loading";
import { PaymentSuccess } from "./payment-success";
import { PaymentFailed } from "./payment-failed";

/**
 * Component container hiển thị kết quả xử lý thanh toán
 * @returns {JSX.Element}
 */
export function View() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [amount, setAmount] = useState<string | null>(null);
  const [orderInfo, setOrderInfo] = useState<string | null>(null);

  useEffect(() => {
    const responseCode = searchParams.get("vnp_ResponseCode");
    const vnpAmount = searchParams.get("vnp_Amount");
    const vnpOrderInfo = searchParams.get("vnp_OrderInfo");

    if (responseCode === "00") {
      setStatus('success');
      if (vnpAmount) {
        // VNPay amount is multiplied by 100
        setAmount((parseInt(vnpAmount) / 100).toString());
      }
      setOrderInfo(vnpOrderInfo);
    } else if (responseCode) {
      setStatus('failed');
    }
  }, [searchParams]);

  if (status === 'loading') {
    return <PaymentLoading />;
  }

  return (
    <div className="max-w-md mx-auto pt-16 pb-24 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {status === 'success' ? (
        <PaymentSuccess amount={amount} orderInfo={orderInfo} />
      ) : (
        <PaymentFailed />
      )}

      <div className="grid grid-cols-1 gap-3 pt-4">
        <Link href="/" className="w-full">
           <Button className="w-full h-14 rounded-2xl font-black text-lg gap-3 shadow-xl shadow-primary/20">
             <Home className="h-5 w-5" />
             Quay lại Trang chủ
           </Button>
        </Link>
        <Link href="/history" className="w-full">
           <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-2 gap-2">
             Xem lịch sử đặt món
             <ArrowRight className="h-4 w-4" />
           </Button>
        </Link>
      </div>

      <div className="text-center">
         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Cảm ơn bạn đã đồng hành cùng MiniOrder!</p>
      </div>
    </div>
  );
}
