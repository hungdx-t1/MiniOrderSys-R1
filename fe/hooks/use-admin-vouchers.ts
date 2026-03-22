import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { AdminVoucher } from "@/types";
import { extractErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

export interface VoucherFormState {
  code: string;
  name: string;
  description: string;
  discountPercent: string;
  active: boolean;
}

export const emptyVoucherForm: VoucherFormState = {
  code: "",
  name: "",
  description: "",
  discountPercent: "10",
  active: true,
};

export function useAdminVouchers() {
  const { user } = useAuth();

  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);
  const [voucherForm, setVoucherForm] = useState<VoucherFormState>(emptyVoucherForm);
  const [editingVoucherId, setEditingVoucherId] = useState<number | null>(null);
  const [isSavingVoucher, setIsSavingVoucher] = useState(false);

  const loadVouchers = useCallback(async () => {
    if (!user?.token) return;
    setIsLoadingVouchers(true);
    try {
      const res = await fetch("/api/admin/vouchers", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extractErrorMessage(data, "Lỗi tải danh sách voucher"));
      setVouchers(data);
    } catch (err: any) {
      toast.error(err.message || "Lỗi kết nối server");
    } finally {
      setIsLoadingVouchers(false);
    }
  }, [user?.token]);

  const handleVoucherSubmit = async () => {
    const discount = parseInt(voucherForm.discountPercent);
    if (!voucherForm.code || isNaN(discount) || discount < 1 || discount > 100) {
      toast.warning("Mã và % giảm (1-100) không hợp lệ");
      return;
    }

    setIsSavingVoucher(true);
    try {
      const isEdit = editingVoucherId !== null;
      const url = isEdit ? `/api/admin/vouchers/${editingVoucherId}` : "/api/admin/vouchers";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { 
          Authorization: `Bearer ${user?.token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ ...voucherForm, discountPercent: discount })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(extractErrorMessage(data, "Lỗi lưu voucher"));

      toast.success(isEdit ? "Cập nhật voucher thành công!" : "Phát hành voucher thành công!");
      setEditingVoucherId(null);
      setVoucherForm(emptyVoucherForm);
      loadVouchers();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingVoucher(false);
    }
  };

  const handleDeleteVoucher = async (id: number) => {
    if (!confirm("Xóa voucher này?")) return;
    try {
      const res = await fetch(`/api/admin/vouchers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error("Xóa thất bại");
      toast.success("Đã xóa voucher");
      loadVouchers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return {
    isLoadingVouchers,
    vouchers,
    voucherForm,
    setVoucherForm,
    editingVoucherId,
    setEditingVoucherId,
    isSavingVoucher,
    loadVouchers,
    handleVoucherSubmit,
    handleDeleteVoucher,
  };
}
