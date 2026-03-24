import { useCallback, useState } from "react";

import { useAuth } from "@/contexts/auth-context";
import { extractErrorMessage } from "@/lib/utils";
import { UserVoucher } from "@/types";
import { toast } from "sonner";

export function useUserVouchers() {
  const { user, isLoggedIn } = useAuth();

  const [vouchers, setVouchers] = useState<UserVoucher[]>([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);

  const loadMyVouchers = useCallback(async () => {
    if (!isLoggedIn) {
      setVouchers([]);
      return;
    }

    setIsLoadingVouchers(true);
    try {
      const response = await fetch("/api/vouchers/my", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        toast.error(extractErrorMessage(payload, "Khong the tai danh sach voucher."));
        return;
      }

      setVouchers(Array.isArray(payload) ? payload : []);
    } catch {
      toast.error("Loi ket noi khi tai voucher cua ban.");
    } finally {
      setIsLoadingVouchers(false);
    }
  }, [isLoggedIn, user?.token]);

  return {
    vouchers,
    isLoadingVouchers,
    loadMyVouchers,
  };
}
