"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TableMap from "./table-map";
import { Ticket, Table as TableIcon } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface OrderInfoProps {
  tableNumber: string;
  onTableSelect: (number: string) => void;
  voucherCode: string;
  onVoucherChange: (code: string) => void;
  onDrawVoucher: () => void;
  isDrawingVoucher: boolean;
  voucherFeedback?: string;
}

export default function OrderInfo({
  tableNumber,
  onTableSelect,
  voucherCode,
  onVoucherChange,
  onDrawVoucher,
  isDrawingVoucher,
  voucherFeedback
}: OrderInfoProps) {
  const { isLoggedIn } = useAuth();
  
  return (
    <Card className="border-2 border-primary/5 shadow-lg shadow-primary/5">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2 mb-1">
           <TableIcon className="h-5 w-5 text-primary" />
           <CardTitle className="text-xl">Thông tin đặt chỗ</CardTitle>
        </div>
        <CardDescription>Chọn bàn trống để bắt đầu gọi món.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-2xl bg-muted/40 p-4 border border-muted/60">
           <TableMap selectedTable={tableNumber} onSelect={onTableSelect} />
        </div>

        <div className="space-y-3 pt-2">
           <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-primary" />
              <label className="text-sm font-bold uppercase tracking-wider opacity-60">Mã giảm giá</label>
           </div>
           
           <div className="flex gap-2">
              <Input
                value={voucherCode}
                onChange={(e) => onVoucherChange(e.target.value.toUpperCase())}
                placeholder="VD: GIAM20"
                className="rounded-xl border-2 border-muted h-11 uppercase font-bold"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={onDrawVoucher}
                disabled={isDrawingVoucher || !isLoggedIn}
                className="rounded-xl h-11 px-4 font-bold border border-muted shadow-sm hover:bg-emerald-500 hover:text-white transition-all shadow-emerald-500/5"
              >
                {isDrawingVoucher ? "..." : "Rút thẻ"}
              </Button>
           </div>
           
           {!isLoggedIn && (
              <p className="text-[10px] text-muted-foreground italic">Đăng nhập để rút thẻ voucher ngẫu nhiên.</p>
           )}
           
           {voucherFeedback && (
              <Badge variant="secondary" className="px-3 py-1.5 h-auto rounded-lg w-full justify-start text-[11px] bg-emerald-50 text-emerald-700 border-emerald-100 italic">
                {voucherFeedback}
              </Badge>
           )}
        </div>
      </CardContent>
    </Card>
  );
}
