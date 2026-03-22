import { Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmptyHistory() {
  return (
    <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-16 text-center space-y-6 animate-in zoom-in-95 duration-500">
       <div className="mx-auto h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
          <Package className="h-12 w-12" />
       </div>
       <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Chưa có đơn hàng nào</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed italic">
            Có vẻ như bạn chưa đặt món nào. Hãy bắt đầu hành trình ẩm thực của mình ngay hôm nay!
          </p>
       </div>
       <Link href="/">
         <Button className="rounded-2xl h-12 px-8 font-black shadow-xl shadow-primary/20">
           Khám phá Menu ngay
         </Button>
       </Link>
    </div>
  );
}
