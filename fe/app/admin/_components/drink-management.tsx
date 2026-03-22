"use client";

import { Product } from "@/types";
import { formatVnd } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, List, X } from "lucide-react";

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  active: boolean;
}

interface DrinkManagementProps {
  products: Product[];
  isLoading: boolean;
  form: ProductFormState;
  onFormChange: (data: Partial<ProductFormState>) => void;
  onSubmit: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onReset: () => void;
  editingId: number | null;
}

export default function DrinkManagement({
  products,
  isLoading,
  form,
  onFormChange,
  onSubmit,
  onEdit,
  onDelete,
  onReset,
  editingId
}: DrinkManagementProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr] items-start">
      {/* Editor Column */}
      <Card className="border-none shadow-xl border-t-4 border-t-primary">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center bg-primary/5 rounded-xl px-4 py-2 mb-2">
             <CardTitle className="text-xl font-black">{editingId ? "Sửa đồ uống" : "Thêm mới"}</CardTitle>
             {editingId && (
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onReset}>
                   <X className="h-4 w-4" />
                </Button>
             )}
          </div>
          <CardDescription>Quản lý menu thức uống trực tiếp.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tên món</label>
                <Input 
                   value={form.name} 
                   onChange={e => onFormChange({ name: e.target.value })} 
                   placeholder="VD: Cà phê cốt dừa"
                   className="rounded-xl border-2 border-muted h-11"
                />
             </div>
             
             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mô tả</label>
                <Textarea 
                   className="w-full min-h-[100px] rounded-xl border-2 border-muted p-3 text-sm focus-visible:ring-primary outline-none focus:border-primary transition-all bg-transparent"
                   value={form.description} 
                   onChange={e => onFormChange({ description: e.target.value })} 
                   placeholder="Miêu tả ngắn gọn thành phần..."
                />
             </div>

             <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Giá bán (VND)</label>
                <Input 
                   type="number"
                   value={form.price} 
                   onChange={e => onFormChange({ price: e.target.value })} 
                   placeholder="35000"
                   className="rounded-xl border-2 border-muted h-11 font-mono font-bold"
                />
             </div>

             <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-muted/60">
                <input 
                   type="checkbox" 
                   id="productActive"
                   checked={form.active} 
                   onChange={e => onFormChange({ active: e.target.checked })} 
                   className="h-5 w-5 accent-emerald-500 rounded-md"
                />
                <label htmlFor="productActive" className="text-sm font-bold select-none cursor-pointer">Cho phép đặt món này</label>
             </div>

             <Button 
                className="w-full h-12 rounded-xl text-lg font-black shadow-lg shadow-primary/10 transition-transform active:scale-95"
                disabled={isLoading}
                type="submit"
             >
                {isLoading ? "Đang lưu..." : editingId ? "Cập nhật ngay" : "Thêm vào menu"}
             </Button>
          </form>
        </CardContent>
      </Card>

      {/* List Column */}
      <div className="space-y-4">
         <div className="flex items-center gap-2 mb-2">
            <List className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-bold uppercase tracking-tighter">Danh sách trong kho ({products.length})</h3>
         </div>
         
         <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {products.map(p => (
               <Card key={p.id} className={`group overflow-hidden border-2 transition-all hover:shadow-lg ${p.active ? "border-muted/60" : "border-rose-100 bg-rose-50/20 grayscale opacity-80"}`}>
                  <CardContent className="p-4 flex flex-col h-full">
                     <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-lg leading-tight flex-1">{p.name}</h4>
                        <Badge variant={p.active ? "secondary" : "destructive"} className="text-[10px] h-5 px-1.5 uppercase font-black">{p.active ? "Đang bán" : "Ẩn"}</Badge>
                     </div>
                     <p className="text-xs text-muted-foreground line-clamp-2 mb-3 flex-1">{p.description || "Chưa có mô tả."}</p>
                     
                     <div className="flex items-center justify-between mt-auto pt-3 border-t border-muted/60">
                        <span className="font-black text-primary">{formatVnd(p.price)}</span>
                        <div className="flex gap-1">
                           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-blue-600 hover:bg-blue-50" onClick={() => onEdit(p)}>
                              <Edit2 className="h-4 w-4" />
                           </Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-600 hover:bg-rose-50" onClick={() => onDelete(p.id)}>
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            ))}
         </div>
         
         {products.length === 0 && (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
               <p className="text-muted-foreground text-sm font-medium">Menu hiện đang trống.</p>
            </div>
         )}
      </div>
    </div>
  );
}

