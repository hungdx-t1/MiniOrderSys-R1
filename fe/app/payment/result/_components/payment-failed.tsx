import { XCircle } from "lucide-react";

/**
 * Component hiển thị thông báo thanh toán thất bại
 * @returns {JSX.Element}
 */
export function PaymentFailed() {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="h-24 w-24 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-rose-500/40 animate-shake">
          <XCircle className="h-14 w-14" />
        </div>
      </div>
      
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-rose-600">Thanh toán thất bại</h1>
        <p className="text-muted-foreground">Giao dịch không thành công hoặc đã bị hủy.</p>
      </div>
      
      <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100 italic text-rose-800 text-sm">
         Vui lòng kiểm tra lại số dư tài khoản hoặc thử lại với phương thức thanh toán khác.
      </div>
    </div>
  );
}
