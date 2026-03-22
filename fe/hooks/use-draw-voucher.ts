import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { extractErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

export function useDrawVoucher(onSuccess?: (code: string) => void) {
  const { isLoggedIn, user, token } = useAuth() as any;
  const [voucherFeedback, setVoucherFeedback] = useState("");
  const [isDrawingVoucher, setIsDrawingVoucher] = useState(false);

  const drawVoucher = async () => {
    if (!isLoggedIn) {
      toast.error("Cần đăng nhập để rút voucher.");
      return;
    }

    setIsDrawingVoucher(true);
    setVoucherFeedback("");

    try {
      const response = await fetch("/api/vouchers/draw", {
        method: "POST",
        headers: { Authorization: `Bearer ${token || user?.token}` },
      });

      const payload = await response.json();
      if (!response.ok) {
        toast.error(extractErrorMessage(payload, "Rút voucher thất bại."));
        return;
      }

      if (payload.code && onSuccess) {
        onSuccess(payload.code);
      }
      setVoucherFeedback(payload.message || "Rút voucher thành công.");
      toast.success("Rút voucher thành công!");
    } catch {
      toast.error("Lỗi kết nối API voucher.");
    } finally {
      setIsDrawingVoucher(false);
    }
  };

  return {
    isDrawingVoucher,
    voucherFeedback,
    drawVoucher,
  };
}
