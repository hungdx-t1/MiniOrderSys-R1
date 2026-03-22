"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Coffee, Ticket, Banknote } from "lucide-react";
import { formatVnd } from "@/lib/utils";

interface AdminStatsCardsProps {
  productCount: number;
  activeProductCount: number;
  voucherCount: number;
  activeVoucherCount: number;
  todayRevenue: number;
}

export default function AdminStatsCards({
  productCount,
  activeProductCount,
  voucherCount,
  activeVoucherCount,
  todayRevenue
}: AdminStatsCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
        <CardContent className="p-4 flex items-center gap-4">
           <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Coffee className="h-6 w-6" />
           </div>
           <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Đồ uống</p>
              <h3 className="text-2xl font-black">{productCount}</h3>
              <p className="text-[10px] text-emerald-600 font-bold">{activeProductCount} đang bán</p>
           </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
        <CardContent className="p-4 flex items-center gap-4">
           <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Ticket className="h-6 w-6" />
           </div>
           <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Vouchers</p>
              <h3 className="text-2xl font-black">{voucherCount}</h3>
              <p className="text-[10px] text-emerald-600 font-bold">{activeVoucherCount} đang hiệu lực</p>
           </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
        <CardContent className="p-4 flex items-center gap-4">
           <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
              <Banknote className="h-6 w-6" />
           </div>
           <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Doanh thu hôm nay</p>
              <h3 className="text-2xl font-black">{formatVnd(todayRevenue)}</h3>
              <p className="text-[10px] text-indigo-500 font-bold">Cập nhật thời gian thực</p>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
