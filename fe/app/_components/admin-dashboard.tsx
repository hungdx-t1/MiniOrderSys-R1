"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import type {
  AdminProductPayload,
  AdminVoucher,
  AdminVoucherPayload,
  ApiError,
  Product,
} from "@/app/_lib/types";

type AdminTab = "drinks" | "vouchers";

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  active: boolean;
}

interface VoucherFormState {
  code: string;
  name: string;
  description: string;
  discountPercent: string;
  active: boolean;
}

const TOKEN_STORAGE_KEY = "mini-order-token";
const USER_STORAGE_KEY = "mini-order-user";
const ROLE_STORAGE_KEY = "mini-order-role";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const emptyProductForm: ProductFormState = {
  name: "",
  description: "",
  price: "",
  active: true,
};

const emptyVoucherForm: VoucherFormState = {
  code: "",
  name: "",
  description: "",
  discountPercent: "10",
  active: true,
};

function toMoneyValue(value: string | number | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function formatVnd(value: string | number | null | undefined) {
  return currencyFormatter.format(toMoneyValue(value));
}

async function readPayload(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload !== "object" || payload === null) {
    return fallback;
  }

  const data = payload as ApiError;

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }

  return fallback;
}

export default function AdminDashboard() {
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<AdminTab>("drinks");
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataFeedback, setDataFeedback] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [vouchers, setVouchers] = useState<AdminVoucher[]>([]);

  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productFeedback, setProductFeedback] = useState("");

  const [voucherForm, setVoucherForm] = useState<VoucherFormState>(emptyVoucherForm);
  const [editingVoucherId, setEditingVoucherId] = useState<number | null>(null);
  const [isSavingVoucher, setIsSavingVoucher] = useState(false);
  const [voucherFeedback, setVoucherFeedback] = useState("");

  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    const savedUser = window.localStorage.getItem(USER_STORAGE_KEY);
    const savedRole = window.localStorage.getItem(ROLE_STORAGE_KEY);

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser) {
      setCurrentUser(savedUser);
    }

    if (savedRole) {
      setCurrentRole(savedRole);
    }

    setHasHydrated(true);
  }, []);

  async function loadAdminData(currentToken: string) {
    if (!currentToken) {
      return;
    }

    setIsLoadingData(true);
    setDataFeedback("");

    try {
      const headers: HeadersInit = {
        Authorization: `Bearer ${currentToken}`,
      };

      const [productsResponse, vouchersResponse] = await Promise.all([
        fetch("/api/admin/products", {
          method: "GET",
          headers,
        }),
        fetch("/api/admin/vouchers", {
          method: "GET",
          headers,
        }),
      ]);

      const productsPayload = await readPayload(productsResponse);
      const vouchersPayload = await readPayload(vouchersResponse);

      if (!productsResponse.ok) {
        setDataFeedback(
          extractErrorMessage(productsPayload, "Khong the tai danh sach do uong.")
        );
        return;
      }

      if (!vouchersResponse.ok) {
        setDataFeedback(
          extractErrorMessage(vouchersPayload, "Khong the tai danh sach voucher.")
        );
        return;
      }

      if (!Array.isArray(productsPayload) || !Array.isArray(vouchersPayload)) {
        setDataFeedback("Du lieu admin tra ve khong hop le.");
        return;
      }

      setProducts(productsPayload as Product[]);
      setVouchers(vouchersPayload as AdminVoucher[]);
    } catch {
      setDataFeedback("Khong the ket noi den API admin.");
    } finally {
      setIsLoadingData(false);
    }
  }

  useEffect(() => {
    if (!hasHydrated || !token || currentRole !== "ADMIN") {
      return;
    }

    void loadAdminData(token);
  }, [hasHydrated, token, currentRole]);

  const activeDrinkCount = useMemo(() => {
    return products.filter((product) => product.active).length;
  }, [products]);

  const activeVoucherCount = useMemo(() => {
    return vouchers.filter((voucher) => voucher.active).length;
  }, [vouchers]);

  function handleLogout() {
    setToken("");
    setCurrentUser("");
    setCurrentRole("");
    setProducts([]);
    setVouchers([]);
    setDataFeedback("");

    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem(ROLE_STORAGE_KEY);
    router.replace("/");
  }

  function resetProductEditor() {
    setEditingProductId(null);
    setProductForm(emptyProductForm);
  }

  function resetVoucherEditor() {
    setEditingVoucherId(null);
    setVoucherForm(emptyVoucherForm);
  }

  function beginEditProduct(product: Product) {
    setActiveTab("drinks");
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      description: product.description,
      price: String(toMoneyValue(product.price)),
      active: product.active,
    });
    setProductFeedback("");
  }

  function beginEditVoucher(voucher: AdminVoucher) {
    setActiveTab("vouchers");
    setEditingVoucherId(voucher.id);
    setVoucherForm({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description,
      discountPercent: String(voucher.discountPercent),
      active: voucher.active,
    });
    setVoucherFeedback("");
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProductFeedback("");

    if (!token) {
      setProductFeedback("Can dang nhap admin de thao tac.");
      return;
    }

    const price = Number.parseFloat(productForm.price);
    if (!productForm.name.trim() || !Number.isFinite(price) || price <= 0) {
      setProductFeedback("Ten va gia do uong phai hop le.");
      return;
    }

    const payload: AdminProductPayload = {
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price,
      active: productForm.active,
    };

    setIsSavingProduct(true);

    try {
      const isEditing = editingProductId !== null;
      const endpoint = isEditing
        ? `/api/admin/products/${editingProductId}`
        : "/api/admin/products";

      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responsePayload = await readPayload(response);
      if (!response.ok) {
        setProductFeedback(
          extractErrorMessage(responsePayload, "Luu do uong that bai.")
        );
        return;
      }

      setProductFeedback(isEditing ? "Cap nhat do uong thanh cong." : "Tao do uong thanh cong.");
      resetProductEditor();
      await loadAdminData(token);
    } catch {
      setProductFeedback("Khong the ket noi den API do uong.");
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function handleDeleteProduct(id: number) {
    if (!token) {
      setProductFeedback("Can dang nhap admin de thao tac.");
      return;
    }

    if (!window.confirm("Ban co chac muon xoa do uong nay?")) {
      return;
    }

    setProductFeedback("");

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await readPayload(response);
      if (!response.ok) {
        setProductFeedback(
          extractErrorMessage(payload, "Xoa do uong that bai.")
        );
        return;
      }

      if (editingProductId === id) {
        resetProductEditor();
      }

      setProductFeedback("Da xoa do uong.");
      await loadAdminData(token);
    } catch {
      setProductFeedback("Khong the ket noi den API do uong.");
    }
  }

  async function handleVoucherSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setVoucherFeedback("");

    if (!token) {
      setVoucherFeedback("Can dang nhap admin de thao tac.");
      return;
    }

    const discountPercent = Number.parseInt(voucherForm.discountPercent, 10);
    if (
      !voucherForm.code.trim() ||
      !voucherForm.name.trim() ||
      !Number.isInteger(discountPercent) ||
      discountPercent < 1 ||
      discountPercent > 100
    ) {
      setVoucherFeedback("Ma, ten va muc giam voucher phai hop le (1-100%).");
      return;
    }

    const payload: AdminVoucherPayload = {
      code: voucherForm.code.trim().toUpperCase(),
      name: voucherForm.name.trim(),
      description: voucherForm.description.trim(),
      discountPercent,
      active: voucherForm.active,
    };

    setIsSavingVoucher(true);

    try {
      const isEditing = editingVoucherId !== null;
      const endpoint = isEditing
        ? `/api/admin/vouchers/${editingVoucherId}`
        : "/api/admin/vouchers";

      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responsePayload = await readPayload(response);
      if (!response.ok) {
        setVoucherFeedback(
          extractErrorMessage(responsePayload, "Luu voucher that bai.")
        );
        return;
      }

      setVoucherFeedback(isEditing ? "Cap nhat voucher thanh cong." : "Tao voucher thanh cong.");
      resetVoucherEditor();
      await loadAdminData(token);
    } catch {
      setVoucherFeedback("Khong the ket noi den API voucher.");
    } finally {
      setIsSavingVoucher(false);
    }
  }

  async function handleDeleteVoucher(id: number) {
    if (!token) {
      setVoucherFeedback("Can dang nhap admin de thao tac.");
      return;
    }

    if (!window.confirm("Ban co chac muon xoa voucher nay?")) {
      return;
    }

    setVoucherFeedback("");

    try {
      const response = await fetch(`/api/admin/vouchers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await readPayload(response);
      if (!response.ok) {
        setVoucherFeedback(
          extractErrorMessage(payload, "Xoa voucher that bai.")
        );
        return;
      }

      if (editingVoucherId === id) {
        resetVoucherEditor();
      }

      setVoucherFeedback("Da xoa voucher.");
      await loadAdminData(token);
    } catch {
      setVoucherFeedback("Khong the ket noi den API voucher.");
    }
  }

  const hasAdminAccess = hasHydrated && Boolean(token) && currentRole === "ADMIN";

  useEffect(() => {
    if (!hasHydrated || hasAdminAccess) {
      return;
    }

    router.replace("/");
  }, [hasHydrated, hasAdminAccess, router]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
      <section className="glass-card pattern-burst fade-up rounded-3xl p-5 sm:p-6">
        <p className="font-display text-xs uppercase tracking-[0.3em] text-brand">Admin Hub</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl leading-tight text-ink">Quan li do uong va voucher</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-xl border border-border-soft px-3 py-2 text-xs font-semibold text-ink transition hover:bg-paper-strong"
            >
              Ve trang dat mon
            </Link>
            {hasAdminAccess ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-border-soft px-3 py-2 text-xs font-semibold text-ink transition hover:bg-paper-strong"
              >
                Dang xuat
              </button>
            ) : null}
          </div>
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
          Khung admin mobile-first de quan li menu do uong va voucher theo vai tro ADMIN.
        </p>
      </section>

      {!hasHydrated ? (
        <section className="glass-card fade-up rounded-3xl p-4 [animation-delay:80ms] sm:p-5">
          <h2 className="font-display text-xl text-ink">Dang xac thuc phien dang nhap</h2>
          <p className="mt-1 text-xs text-ink-soft">
            Vui long cho trong giay lat...
          </p>
        </section>
      ) : !hasAdminAccess ? (
        <section className="glass-card fade-up rounded-3xl p-4 [animation-delay:80ms] sm:p-5">
          <h2 className="font-display text-xl text-ink">Khong co quyen truy cap admin</h2>
          <p className="mt-1 text-xs text-ink-soft">
            Ban can dang nhap bang tai khoan ADMIN o trang dat mon de vao khu vuc nay.
          </p>
          <p className="mt-2 rounded-xl bg-paper-strong px-3 py-2 text-xs font-medium text-ink">
            Dang quay ve trang dat mon...
          </p>
        </section>
      ) : (
        <>
          <section className="glass-card fade-up rounded-3xl p-4 [animation-delay:80ms] sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-ink-soft">
                Dang dang nhap voi <strong className="text-ink">{currentUser}</strong> ({currentRole})
              </p>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <article className="rounded-2xl bg-white/75 px-3 py-3">
                <p className="text-xs uppercase tracking-wider text-ink-soft">Tong do uong</p>
                <p className="mt-1 font-display text-2xl text-ink">{products.length}</p>
                <p className="text-xs text-mint">{activeDrinkCount} dang hoat dong</p>
              </article>
              <article className="rounded-2xl bg-white/75 px-3 py-3">
                <p className="text-xs uppercase tracking-wider text-ink-soft">Tong voucher</p>
                <p className="mt-1 font-display text-2xl text-ink">{vouchers.length}</p>
                <p className="text-xs text-mint">{activeVoucherCount} dang hoat dong</p>
              </article>
              <article className="rounded-2xl bg-white/75 px-3 py-3">
                <p className="text-xs uppercase tracking-wider text-ink-soft">Du lieu</p>
                <button
                  type="button"
                  onClick={() => {
                    void loadAdminData(token);
                  }}
                  disabled={isLoadingData}
                  className="mt-2 rounded-xl border border-border-soft px-3 py-2 text-xs font-semibold text-ink transition hover:bg-paper-strong disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoadingData ? "Dang tai..." : "Tai lai"}
                </button>
              </article>
            </div>

            {dataFeedback ? (
              <p className="mt-3 rounded-xl bg-brand/10 px-3 py-2 text-xs font-medium text-brand">
                {dataFeedback}
              </p>
            ) : null}
          </section>

          <section className="fade-up [animation-delay:140ms]">
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-paper/60 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("drinks")}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${activeTab === "drinks"
                  ? "bg-brand text-white"
                  : "text-ink-soft hover:bg-paper-strong"
                  }`}
              >
                Quan li do uong
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("vouchers")}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${activeTab === "vouchers"
                  ? "bg-brand text-white"
                  : "text-ink-soft hover:bg-paper-strong"
                  }`}
              >
                Quan li voucher
              </button>
            </div>
          </section>

          {activeTab === "drinks" ? (
            <section className="grid gap-3 lg:grid-cols-[0.95fr_1.35fr]">
              <article className="glass-card fade-up rounded-3xl p-4 [animation-delay:180ms] sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg text-ink">
                    {editingProductId ? "Sua do uong" : "Them do uong"}
                  </h3>
                  {editingProductId ? (
                    <button
                      type="button"
                      onClick={resetProductEditor}
                      className="rounded-xl border border-border-soft px-3 py-2 text-xs font-semibold text-ink hover:bg-paper-strong"
                    >
                      Huy sua
                    </button>
                  ) : null}
                </div>

                <form onSubmit={handleProductSubmit} className="mt-3 space-y-2.5">
                  <input
                    value={productForm.name}
                    onChange={(event) => {
                      setProductForm((prev) => ({ ...prev, name: event.target.value }));
                    }}
                    className="w-full rounded-2xl border border-border-soft bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                    placeholder="Ten do uong"
                  />
                  <textarea
                    value={productForm.description}
                    onChange={(event) => {
                      setProductForm((prev) => ({ ...prev, description: event.target.value }));
                    }}
                    className="min-h-20 w-full rounded-2xl border border-border-soft bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                    placeholder="Mo ta ngan"
                  />
                  <input
                    value={productForm.price}
                    onChange={(event) => {
                      setProductForm((prev) => ({ ...prev, price: event.target.value }));
                    }}
                    className="w-full rounded-2xl border border-border-soft bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                    placeholder="Gia (VD: 30000)"
                    type="number"
                    min="0"
                    step="1000"
                  />
                  <label className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={productForm.active}
                      onChange={(event) => {
                        setProductForm((prev) => ({ ...prev, active: event.target.checked }));
                      }}
                    />
                    Hien thi tren menu
                  </label>
                  <button
                    type="submit"
                    disabled={isSavingProduct}
                    className="w-full rounded-2xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingProduct
                      ? "Dang luu..."
                      : editingProductId
                        ? "Cap nhat do uong"
                        : "Tao do uong"}
                  </button>
                </form>

                {productFeedback ? (
                  <p className="mt-3 rounded-xl bg-paper-strong px-3 py-2 text-xs font-medium text-ink">
                    {productFeedback}
                  </p>
                ) : null}
              </article>

              <article className="space-y-2">
                {products.map((product, index) => (
                  <div
                    key={product.id}
                    className="glass-card fade-up rounded-2xl p-3"
                    style={{ animationDelay: `${220 + index * 40}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-display text-base text-ink">{product.name}</h4>
                        <p className="mt-1 text-xs text-ink-soft">
                          {product.description || "Khong co mo ta"}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${product.active
                          ? "bg-mint/15 text-mint"
                          : "bg-brand/12 text-brand"
                          }`}
                      >
                        {product.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-brand">{formatVnd(product.price)}</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => beginEditProduct(product)}
                          className="rounded-xl border border-border-soft px-3 py-2 text-xs font-semibold text-ink hover:bg-paper-strong"
                        >
                          Sua
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleDeleteProduct(product.id);
                          }}
                          className="rounded-xl border border-brand/25 px-3 py-2 text-xs font-semibold text-brand hover:bg-brand/10"
                        >
                          Xoa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {products.length === 0 ? (
                  <p className="glass-card rounded-2xl p-4 text-sm text-ink-soft">Chua co do uong nao.</p>
                ) : null}
              </article>
            </section>
          ) : (
            <section className="grid gap-3 lg:grid-cols-[0.95fr_1.35fr]">
              <article className="glass-card fade-up rounded-3xl p-4 [animation-delay:180ms] sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-lg text-ink">
                    {editingVoucherId ? "Sua voucher" : "Them voucher"}
                  </h3>
                  {editingVoucherId ? (
                    <button
                      type="button"
                      onClick={resetVoucherEditor}
                      className="rounded-xl border border-border-soft px-3 py-2 text-xs font-semibold text-ink hover:bg-paper-strong"
                    >
                      Huy sua
                    </button>
                  ) : null}
                </div>

                <form onSubmit={handleVoucherSubmit} className="mt-3 space-y-2.5">
                  <input
                    value={voucherForm.code}
                    onChange={(event) => {
                      setVoucherForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }));
                    }}
                    className="w-full rounded-2xl border border-border-soft bg-white px-3 py-2.5 text-sm uppercase outline-none transition focus:border-brand"
                    placeholder="Ma voucher (VD: GIAM20)"
                  />
                  <input
                    value={voucherForm.name}
                    onChange={(event) => {
                      setVoucherForm((prev) => ({ ...prev, name: event.target.value }));
                    }}
                    className="w-full rounded-2xl border border-border-soft bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                    placeholder="Ten voucher"
                  />
                  <textarea
                    value={voucherForm.description}
                    onChange={(event) => {
                      setVoucherForm((prev) => ({ ...prev, description: event.target.value }));
                    }}
                    className="min-h-20 w-full rounded-2xl border border-border-soft bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                    placeholder="Mo ta voucher"
                  />
                  <input
                    value={voucherForm.discountPercent}
                    onChange={(event) => {
                      setVoucherForm((prev) => ({ ...prev, discountPercent: event.target.value }));
                    }}
                    className="w-full rounded-2xl border border-border-soft bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                    placeholder="Muc giam (1-100)"
                    type="number"
                    min="1"
                    max="100"
                  />
                  <label className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-sm text-ink">
                    <input
                      type="checkbox"
                      checked={voucherForm.active}
                      onChange={(event) => {
                        setVoucherForm((prev) => ({ ...prev, active: event.target.checked }));
                      }}
                    />
                    Voucher dang hoat dong
                  </label>
                  <button
                    type="submit"
                    disabled={isSavingVoucher}
                    className="w-full rounded-2xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingVoucher
                      ? "Dang luu..."
                      : editingVoucherId
                        ? "Cap nhat voucher"
                        : "Tao voucher"}
                  </button>
                </form>

                {voucherFeedback ? (
                  <p className="mt-3 rounded-xl bg-paper-strong px-3 py-2 text-xs font-medium text-ink">
                    {voucherFeedback}
                  </p>
                ) : null}
              </article>

              <article className="space-y-2">
                {vouchers.map((voucher, index) => (
                  <div
                    key={voucher.id}
                    className="glass-card fade-up rounded-2xl p-3"
                    style={{ animationDelay: `${220 + index * 40}ms` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-display text-base text-ink">{voucher.code}</h4>
                        <p className="mt-1 text-xs text-ink-soft">{voucher.name}</p>
                        <p className="mt-1 text-xs text-ink-soft">
                          {voucher.description || "Khong co mo ta"}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${voucher.active
                          ? "bg-mint/15 text-mint"
                          : "bg-brand/12 text-brand"
                          }`}
                      >
                        {voucher.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-brand">Giam {voucher.discountPercent}%</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => beginEditVoucher(voucher)}
                          className="rounded-xl border border-border-soft px-3 py-2 text-xs font-semibold text-ink hover:bg-paper-strong"
                        >
                          Sua
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void handleDeleteVoucher(voucher.id);
                          }}
                          className="rounded-xl border border-brand/25 px-3 py-2 text-xs font-semibold text-brand hover:bg-brand/10"
                        >
                          Xoa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {vouchers.length === 0 ? (
                  <p className="glass-card rounded-2xl p-4 text-sm text-ink-soft">Chua co voucher nao.</p>
                ) : null}
              </article>
            </section>
          )}
        </>
      )}
    </main>
  );
}
