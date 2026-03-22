import { useState, useCallback } from "react";
import { Product, ApiError } from "@/types";
import { extractErrorMessage } from "@/lib/utils";
import { toast } from "sonner";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  const loadProducts = useCallback(async (signal?: AbortSignal) => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch("/api/products", {
        method: "GET",
        cache: "no-store",
        signal,
      });

      const payload = await response.json();
      if (!response.ok) {
        toast.error(extractErrorMessage(payload, "Không thể tải danh sách món."));
        return;
      }
      setProducts(payload);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        toast.error("Lỗi kết nối API sản phẩm.");
      }
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  return {
    products,
    isLoadingProducts,
    loadProducts,
  };
}
