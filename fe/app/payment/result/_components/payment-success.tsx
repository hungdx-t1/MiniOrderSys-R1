import { CheckCircle2, Receipt } from "lucide-react";
import { formatVnd } from "@/lib/utils";

interface PaymentSuccessProps {
  amount: string | null;
  orderInfo: string | null;
}

/**
 * Component hiển thị thông báo thanh toán thành công
 * @param {PaymentSuccessProps} props - Thông tin thanh toán
 * @returns {JSX.Element}
 */
export function PaymentSuccess({ amount, orderInfo }: PaymentSuccessProps) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="h-24 w-24 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 animate-bounce">
          <CheckCircle2 className="h-14 w-14" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight">Thanh toán thành công!</h1>
        <p className="text-muted-foreground">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-6 text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Receipt className="h-24 w-24" />
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Số tiền thanh toán</span>
            <span className="font-black text-xl text-primary">{formatVnd(amount || "0")}</span>
          </div>
          <div className="flex justify-between items-start text-sm pt-4 border-t border-slate-50">
            <span className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] pt-1">Nội dung</span>
            <span className="font-bold text-slate-700 text-right max-w-[200px]">{orderInfo || "Thanh toán đơn hàng Cafe"}</span>
          </div>
          <div className="flex justify-between items-center text-sm pt-4 border-t border-slate-50">
            <span className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Trạng thái</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full font-black text-[10px] uppercase">Đã hoàn tất</span>
          </div>
        </div>
      </div>
    </div>
  );
}
