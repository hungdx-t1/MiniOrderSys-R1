"use client";

import { Product } from "@/types";
import { formatVnd } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductListProps {
  products: Product[];
  isLoading: boolean;
  cart: Record<number, number>;
  onQuantityChange: (productId: number, delta: number) => void;
  onReload: () => void;
}

export default function ProductList({
  products,
  isLoading,
  cart,
  onQuantityChange,
  onReload
}: ProductListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <h2 className="font-display text-2xl font-bold">Menu</h2>
           <Badge variant="secondary" className="rounded-md font-mono">{products.length}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={onReload}>Tải lại</Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {products.map((product) => {
          const quantity = cart[product.id] ?? 0;
          return (
            <Card key={product.id} className="group overflow-hidden transition-all duration-300 hover:shadow-md border-muted/60">
              <CardContent className="p-0">
                <div className="flex h-full">
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex justify-between items-start mb-1">
                       <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                          {product.name}
                       </h3>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mb-3">
                      {product.description || "Món ăn chưa có mô tả chi tiết."}
                    </p>
                    <div className="flex items-end justify-between">
                      <p className="font-bold text-primary">{formatVnd(product.price)}</p>
                      
                      <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl border border-muted">
                        {quantity > 0 && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg hover:bg-background"
                              onClick={() => onQuantityChange(product.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="min-w-5 text-center text-xs font-bold font-mono">
                              {quantity}
                            </span>
                          </>
                        )}
                        <Button
                          variant={quantity > 0 ? "default" : "secondary"}
                          size="icon"
                          className="h-7 w-7 rounded-lg shadow-sm"
                          onClick={() => onQuantityChange(product.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
