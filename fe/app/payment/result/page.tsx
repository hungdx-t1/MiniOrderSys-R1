import { Metadata } from 'next';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { View } from './_components/view';

export const metadata: Metadata = {
  title: 'Kết quả thanh toán | MiniOrder',
  description: 'Kết quả thanh toán đơn hàng của bạn.',
};

/**
 * Trang kiểm tra và hiển thị kết quả giao dịch
 * @returns {JSX.Element}
 */
export default function PaymentResultPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
        <View />
      </Suspense>
    </div>
  );
}
