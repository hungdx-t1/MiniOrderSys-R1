import { Loader2 } from "lucide-react";

/**
 * Component hiển thị trạng thái đang tải khi kiểm tra giao dịch
 * @returns {JSX.Element}
 */
export function PaymentLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-lg font-bold text-muted-foreground animate-pulse">Đang xác thực giao dịch...</p>
    </div>
  );
}
