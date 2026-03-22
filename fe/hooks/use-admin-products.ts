import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Product } from "@/types";
import { extractErrorMessage, toMoneyValue } from "@/lib/utils";
import { toast } from "sonner";

export interface ProductFormState {
  name: string;
  description: string;
  price: string;
  active: boolean;
}

export const emptyProductForm: ProductFormState = {
  name: "",
  description: "",
  price: "",
  active: true,
};

export function useAdminProducts() {
  const { user } = useAuth();

  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!user?.token) return;
    setIsLoadingProducts(true);
    try {
      const res = await fetch("/api/admin/products", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(extractErrorMessage(data, "Lỗi tải đồ uống"));
      setProducts(data);
    } catch (err: any) {
      toast.error(err.message || "Lỗi tải danh sách sản phẩm");
    } finally {
      setIsLoadingProducts(false);
    }
  }, [user?.token]);

  const handleProductSubmit = async () => {
    const price = toMoneyValue(productForm.price);
    if (!productForm.name.trim() || price <= 0) {
      toast.warning("Vui lòng nhập tên và giá hợp lệ");
      return;
    }

    setIsSavingProduct(true);
    try {
      const isEdit = editingProductId !== null;
      const url = isEdit ? `/api/admin/products/${editingProductId}` : "/api/admin/products";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { 
          Authorization: `Bearer ${user?.token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ ...productForm, price })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(extractErrorMessage(data, "Lỗi lưu sản phẩm"));

      toast.success(isEdit ? "Cập nhật thành công!" : "Thêm mới thành công!");
      setEditingProductId(null);
      setProductForm(emptyProductForm);
      loadProducts();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Xóa món này khỏi menu?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      if (!res.ok) throw new Error("Xóa thất bại");
      toast.success("Đã xóa sản phẩm");
      loadProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return {
    isLoadingProducts,
    products,
    productForm,
    setProductForm,
    editingProductId,
    setEditingProductId,
    isSavingProduct,
    loadProducts,
    handleProductSubmit,
    handleDeleteProduct,
  };
}
