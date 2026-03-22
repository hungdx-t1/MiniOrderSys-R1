import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { InvoiceResponse } from "@/types";
import { extractErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

export function useAdminHistory() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user?.token) return;
    setIsLoading(true);
    try {
      const resp = await fetch("/api/admin/invoices", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(extractErrorMessage(data, "Lỗi tải lịch sử hóa đơn"));
      
      // Sắp xếp đơn mới nhất lên đầu
      const sortedData = data.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setInvoices(sortedData);
    } catch (err: any) {
      toast.error(err.message || "Lỗi kết nối server");
    } finally {
      setIsLoading(false);
    }
  }, [user?.token]);

  return {
    invoices,
    isLoading,
    fetchHistory,
  };
}
