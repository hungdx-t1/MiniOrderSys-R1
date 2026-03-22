"use client";

import { AdminVoucher, AdminVoucherPayload } from "@/types";
import { formatVnd } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Ticket, X, Percent } from "lucide-react";

interface VoucherFormState {
  code: string;
  name: string;
  description: string;
  discountPercent: string;
  active: boolean;
}

interface VoucherManagementProps {
  vouchers: AdminVoucher[];
  isLoading: boolean;
  form: VoucherFormState;
  onFormChange: (data: Partial<VoucherFormState>) => void;
  onSubmit: () => void;
  onEdit: (voucher: AdminVoucher) => void;
  onDelete: (id: number) => void;
  onReset: () => void;
  editingId: number | null;
}

export default function VoucherManagement({
  vouchers,
  isLoading,
  form,
  onFormChange,
  onSubmit,
  onEdit,
  onDelete,
  onReset,
  editingId
}: VoucherManagementProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr] items-start">
      {/* Editor Column */}
      <Card className="border-none shadow-xl border-t-4 border-t-emerald-500">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center bg-emerald-500/5 rounded-xl px-4 py-2 mb-2">
             <CardTitle className="text-xl font-black text-emerald-700">{editingId ? "Sửa Voucher" : "Tạo Voucher mới"}</CardTitle>
             {editingId && (
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onReset}>
                   <X className="h-4 w-4" />
                </Button>
             )}
          </div>
          <CardDescription>Cài đặt các chương trình khuyến mãi.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground leading-none">Mã CODE</label>
                   <Input 
                      value={form.code} 
                      onChange={e => onFormChange({ code: e.target.value.toUpperCase() })} 
                      placeholder="VD: GIAM20"
                      className="rounded-xl border-2 border-muted h-11 uppercase font-black tracking-widest"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground leading-none">Giảm (%)</label>
                   <div className="relative group">
                      <Percent className="absolute right-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                      <Input 
                         type="number"
                         value={form.discountPercent} 
                         onChange={e => onFormChange({ discountPercent: e.target.value })} 
                         placeholder="10"
                         className="rounded-xl border-2 border-muted h-11 font-mono font-bold pr-10"
                      />
                   </div>
                </div>
             </div>
             
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground leading-none">Tên Voucher</label>
                <Input 
                   value={form.name} 
                   onChange={e => onFormChange({ name: e.target.value })} 
                   placeholder="VD: Mừng khai trương"
                   className="rounded-xl border-2 border-muted h-11"
                />
             </div>
             
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground leading-none">Ghi chú điều kiện</label>
                <textarea 
                   className="w-full min-h-[80px] rounded-xl border-2 border-muted p-3 text-sm focus-visible:ring-emerald-500 outline-none focus:border-emerald-500 transition-all bg-transparent"
                   value={form.description} 
                   onChange={e => onFormChange({ description: e.target.value })} 
                   placeholder="Áp dụng cho mọi đơn hàng..."
                />
             </div>

             <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <input 
                   type="checkbox" 
                   id="voucherActive"
                   checked={form.active} 
                   onChange={e => onFormChange({ active: e.target.checked })} 
                   className="h-5 w-5 accent-emerald-500 rounded-md"
                />
                <label htmlFor="voucherActive" className="text-sm font-bold text-emerald-800 select-none cursor-pointer uppercase tracking-tight">Kích hoạt Voucher này ngay</label>
             </div>

             <Button 
                className="w-full h-12 rounded-xl text-lg font-black shadow-lg shadow-emerald-500/10 bg-emerald-600 hover:bg-emerald-700 transition-transform active:scale-95"
                disabled={isLoading}
                type="submit"
             >
                {isLoading ? "Đang xử lý..." : editingId ? "Lưu thay đổi" : "Phát hành Voucher"}
             </Button>
          </form>
        </CardContent>
      </Card>

      {/* List Column */}
      <div className="space-y-4">
         <div className="flex items-center gap-2 mb-2">
            <Ticket className="h-5 w-5 text-emerald-600" />
            <h3 className="text-xl font-bold uppercase tracking-tighter">Kho ưu đãi hiện có ({vouchers.length})</h3>
         </div>
         
         <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {vouchers.map(v => (
               <Card key={v.id} className={`group overflow-hidden border-2 transition-all hover:shadow-lg ${v.active ? "border-emerald-100 bg-emerald-50/5" : "border-rose-100 bg-rose-50/20 grayscale opacity-80"}`}>
                  <CardContent className="p-4 flex flex-col h-full">
                     <div className="flex justify-between items-start mb-1">
                        <div className="flex flex-col">
                           <h4 className="font-black text-xl leading-none text-emerald-700 tracking-wider mb-1 uppercase">{v.code}</h4>
                           <span className="text-xs font-bold text-muted-foreground uppercase opacity-80">{v.name}</span>
                        </div>
                        <Badge variant={v.active ? "secondary" : "destructive"} className="text-[10px] h-5 px-1.5 uppercase font-black bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{v.active ? "Hoạt động" : "Dừng"}</Badge>
                     </div>
                     <p className="text-[11px] font-medium text-muted-foreground/70 italic line-clamp-1 mb-4">{v.description || "Không có điều kiện áp dụng."}</p>
                     
                     <div className="flex items-center justify-between mt-auto pt-3 border-t border-muted/60">
                        <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1 rounded-full">
                           <span className="text-sm font-black whitespace-nowrap">Giảm {v.discountPercent}%</span>
                        </div>
                        <div className="flex gap-1">
                           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-emerald-600 hover:bg-emerald-50" onClick={() => onEdit(v)}>
                              <Edit2 className="h-4 w-4" />
                           </Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-600 hover:bg-rose-50" onClick={() => onDelete(v.id)}>
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>
         
         {vouchers.length === 0 && (
            <div className="text-center py-20 bg-emerald-50/20 rounded-3xl border-2 border-dashed border-emerald-100">
               <p className="text-emerald-700/50 text-sm font-medium">Hiện chưa có voucher nào được phát hành.</p>
            </div>
         )}
      </div>
    </div>
  );
}
