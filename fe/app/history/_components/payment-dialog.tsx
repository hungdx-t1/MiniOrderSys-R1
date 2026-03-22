import { Dialog } from '@base-ui/react/dialog';
import { ShieldCheck, Banknote, CreditCard, Check, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrderId: number | null;
  paymentMethod: 'CASH' | 'VNPAY';
  onPaymentMethodChange: (method: 'CASH' | 'VNPAY') => void;
  isPaying: boolean;
  onPaymentSubmit: () => void;
}

export function PaymentDialog({
  isOpen,
  onOpenChange,
  selectedOrderId,
  paymentMethod,
  onPaymentMethodChange,
  isPaying,
  onPaymentSubmit
}: PaymentDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300 z-50" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-lg bg-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-slate-900/20 border border-slate-100 p-6 sm:p-10 animate-in zoom-in-95 fade-in duration-300 z-50 focus:outline-none">
           <div className="space-y-6 sm:space-y-8">
             <div className="text-center space-y-2">
               <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-3 sm:mb-4">
                 <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10" />
               </div>
               <Dialog.Title className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Thanh toán đơn hàng</Dialog.Title>
               <Dialog.Description className="text-sm sm:text-base text-slate-500 font-medium italic">
                 Chọn phương thức bạn muốn để hoàn tất đơn #{selectedOrderId}
               </Dialog.Description>
             </div>

             <div className="grid gap-3 sm:gap-4">
               <button 
                 onClick={() => onPaymentMethodChange('CASH')}
                 className={`flex items-center justify-between p-4 sm:p-6 rounded-3xl sm:rounded-[2rem] border-2 transition-all group ${
                   paymentMethod === 'CASH' 
                     ? 'border-emerald-500 bg-emerald-50/50 shadow-lg shadow-emerald-500/10' 
                     : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                 }`}
               >
                 <div className="flex items-center gap-4 sm:gap-5">
                    <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                      paymentMethod === 'CASH' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 group-hover:text-slate-600'
                    }`}>
                      <Banknote className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm sm:text-base font-black tracking-tight ${paymentMethod === 'CASH' ? 'text-emerald-700' : 'text-slate-700'}`}>Tiền mặt tại quầy</p>
                      <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Nhân viên sẽ hỗ trợ bạn</p>
                    </div>
                 </div>
                 {paymentMethod === 'CASH' && <div className="h-5 w-5 sm:h-6 sm:w-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0"><Check className="h-3 w-3 sm:h-4 sm:w-4" /></div>}
               </button>

               <button 
                  onClick={() => onPaymentMethodChange('VNPAY')}
                  className={`flex items-center justify-between p-4 sm:p-6 rounded-3xl sm:rounded-[2rem] border-2 transition-all group ${
                    paymentMethod === 'VNPAY' 
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' 
                      : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-center gap-4 sm:gap-5">
                     <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                       paymentMethod === 'VNPAY' ? 'bg-primary text-white' : 'bg-white text-slate-400 group-hover:text-slate-600'
                     }`}>
                       <CreditCard className="h-6 w-6 sm:h-7 sm:w-7" />
                     </div>
                     <div className="text-left">
                       <p className={`text-sm sm:text-base font-black tracking-tight ${paymentMethod === 'VNPAY' ? 'text-primary' : 'text-slate-700'}`}>VNPay / Chuyển khoản</p>
                       <p className="text-[10px] sm:text-xs text-slate-400 font-medium">Thanh toán nhanh qua QR-Code</p>
                     </div>
                  </div>
                  {paymentMethod === 'VNPAY' && <div className="h-5 w-5 sm:h-6 sm:w-6 bg-primary rounded-full flex items-center justify-center text-white shrink-0"><Check className="h-3 w-3 sm:h-4 sm:w-4" /></div>}
                </button>
             </div>

             <div className="pt-2 flex gap-2 sm:gap-3">
               <Dialog.Close className="flex-1 h-12 sm:h-16 rounded-xl sm:rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 text-sm sm:text-base">
                 Hủy
               </Dialog.Close>
               <Button 
                 className="flex-[2] h-12 sm:h-16 rounded-xl sm:rounded-2xl font-black bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-900/20 gap-2 text-sm sm:text-lg active:scale-95 transition-all"
                 disabled={isPaying}
                 onClick={onPaymentSubmit}
               >
                 {isPaying ? (
                   <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" />
                 ) : (
                   <>
                     Xác nhận
                     <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                   </>
                 )}
               </Button>
             </div>
           </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
