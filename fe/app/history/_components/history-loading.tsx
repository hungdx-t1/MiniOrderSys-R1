import { Loader2 } from "lucide-react";

export function HistoryLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-slate-50/50">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-lg font-bold text-muted-foreground italic">Đang tìm lại ký ức đặt món của bạn...</p>
    </div>
  );
}
