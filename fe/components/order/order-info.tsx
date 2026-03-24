"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TableMap from "./table-map";
import { Table as TableIcon } from "lucide-react";

interface OrderInfoProps {
  tableNumber: string;
  onTableSelect: (number: string) => void;
}

export default function OrderInfo({
  tableNumber,
  onTableSelect
}: OrderInfoProps) {
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
      </CardContent>
    </Card>
  );
}
