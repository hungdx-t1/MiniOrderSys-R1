"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import type {
  ApiError,
  AuthResponse,
  OrderCreatePayload,
  OrderResponse,
  Product,
  VoucherDrawResponse,
} from "@/app/_lib/types";

type AuthMode = "login" | "register";
type CartState = Record<number, number>;

interface CartItemView {
  product: Product;
  quantity: number;
  lineTotal: number;
}

const TOKEN_STORAGE_KEY = "mini-order-token";
const USER_STORAGE_KEY = "mini-order-user";
const ROLE_STORAGE_KEY = "mini-order-role";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatVnd(value: number) {
  return currencyFormatter.format(value);
}

function toMoneyValue(value: number | string | null | undefined) {
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

function extractErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload !== "object" || payload === null) {
    return fallback;
  }

  const withMessage = payload as ApiError;
  if (typeof withMessage.message === "string" && withMessage.message.trim()) {
    return withMessage.message;
  }

  if (typeof withMessage.error === "string" && withMessage.error.trim()) {
    return withMessage.error;
  }

  return fallback;
}

async function parseResponsePayload<T>(response: Response) {
  const rawText = await response.text();
  if (!rawText) {
    return null;
  }

  try {
    return JSON.parse(rawText) as T | ApiError;
  } catch {
    return { message: rawText } as ApiError;
  }
}

function isAuthResponse(payload: unknown): payload is AuthResponse {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const value = payload as Partial<AuthResponse>;
  return (
    typeof value.accessToken === "string" &&
    typeof value.username === "string" &&
    typeof value.role === "string"
  );
}

function isVoucherDrawResponse(payload: unknown): payload is VoucherDrawResponse {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const value = payload as Partial<VoucherDrawResponse>;
  return typeof value.message === "string" || typeof value.code === "string";
}

function isOrderResponse(payload: unknown): payload is OrderResponse {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const value = payload as Partial<OrderResponse>;
  return typeof value.orderId === "number" && Array.isArray(value.items);
}

export default function MobileOrderApp() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productFeedback, setProductFeedback] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);

  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authFeedback, setAuthFeedback] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [token, setToken] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [currentRole, setCurrentRole] = useState("");

  const [tableNumber, setTableNumber] = useState("A1");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherFeedback, setVoucherFeedback] = useState("");
  const [isDrawingVoucher, setIsDrawingVoucher] = useState(false);

  const [cart, setCart] = useState<CartState>({});
  const [orderFeedback, setOrderFeedback] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [latestOrder, setLatestOrder] = useState<OrderResponse | null>(null);

  const isLoggedIn = hasHydrated && token.length > 0;
  const hasAdminAccess = isLoggedIn && currentRole === "ADMIN";

  const productById = useMemo(() => {
    const map = new Map<number, Product>();
    for (const product of products) {
      map.set(product.id, product);
    }
    return map;
  }, [products]);

  const saveAuthSession = useCallback((authData: AuthResponse) => {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, authData.accessToken);
    window.localStorage.setItem(USER_STORAGE_KEY, authData.username);
    window.localStorage.setItem(ROLE_STORAGE_KEY, authData.role);
  }, []);

  const clearAuthSession = useCallback(() => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
    window.localStorage.removeItem(ROLE_STORAGE_KEY);
  }, []);

  const loadProducts = useCallback(async (signal?: AbortSignal) => {
    setIsLoadingProducts(true);
    setProductFeedback("");

    try {
      const response = await fetch("/api/products", {
        method: "GET",
        cache: "no-store",
        signal,
      });

      const payload = await parseResponsePayload<Product[]>(response);
      if (!response.ok) {
        setProductFeedback(extractErrorMessage(payload, "Khong the lay danh sach mon."));
        return;
      }

      if (!Array.isArray(payload)) {
        setProductFeedback("Du lieu mon an khong hop le.");
        return;
      }

      setProducts(payload);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setProductFeedback("Khong the ket noi den he thong FE API.");
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    const savedUser = window.localStorage.getItem(USER_STORAGE_KEY);
    const savedRole = window.localStorage.getItem(ROLE_STORAGE_KEY);

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser) {
      setCurrentUser(savedUser);
      setUsername(savedUser);
    }

    if (savedRole) {
      setCurrentRole(savedRole);
    }

    setHasHydrated(true);

    const abortController = new AbortController();
    void loadProducts(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [loadProducts]);

  const cartItems = useMemo<CartItemView[]>(() => {
    return Object.entries(cart).flatMap(([rawProductId, quantity]) => {
      if (quantity <= 0) {
        return [];
      }

      const productId = Number(rawProductId);
      if (!Number.isFinite(productId)) {
        return [];
      }

      const product = productById.get(productId);
      if (!product) {
        return [];
      }

      return [
        {
          product,
          quantity,
          lineTotal: toMoneyValue(product.price) * quantity,
        },
      ];
    });
  }, [cart, productById]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const subTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  }, [cartItems]);

  const reloadProducts = useCallback(() => {
    void loadProducts();
  }, [loadProducts]);

  function changeQuantity(productId: number, nextValue: number) {
    setCart((prev) => {
      const next = { ...prev };
      if (nextValue <= 0) {
        delete next[productId];
      } else {
        next[productId] = nextValue;
      }
      return next;
    });
  }

  function bumpQuantity(productId: number, delta: number) {
    const current = cart[productId] ?? 0;
    changeQuantity(productId, current + delta);
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthFeedback("");

    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password.trim()) {
      setAuthFeedback("Vui long nhap day du username va password.");
      return;
    }

    setIsAuthenticating(true);

    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: normalizedUsername,
          password,
        }),
      });

      const payload = await parseResponsePayload<AuthResponse>(response);
      if (!response.ok) {
        setAuthFeedback(
          extractErrorMessage(payload, "Dang nhap hoac dang ky that bai.")
        );
        return;
      }

      if (!isAuthResponse(payload)) {
        setAuthFeedback("Du lieu xac thuc khong hop le.");
        return;
      }

      const authData = payload;
      setToken(authData.accessToken);
      setCurrentUser(authData.username);
      setCurrentRole(authData.role);
      setUsername(authData.username);
      setPassword("");

      saveAuthSession(authData);

      setAuthFeedback(
        authMode === "login"
          ? "Dang nhap thanh cong."
          : "Dang ky thanh cong va da dang nhap."
      );
    } catch {
      setAuthFeedback("Khong the ket noi den may chu dang nhap.");
    } finally {
      setIsAuthenticating(false);
    }
  }

  function handleLogout() {
    setToken("");
    setCurrentUser("");
    setCurrentRole("");
    setVoucherCode("");
    setVoucherFeedback("");
    setAuthFeedback("Da dang xuat.");
    clearAuthSession();
  }

  async function handleDrawVoucher() {
    if (!token) {
      setVoucherFeedback("Can dang nhap de rut voucher.");
      return;
    }

    setIsDrawingVoucher(true);
    setVoucherFeedback("");

    try {
      const response = await fetch("/api/vouchers/draw", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await parseResponsePayload<VoucherDrawResponse>(response);
      if (!response.ok) {
        setVoucherFeedback(extractErrorMessage(payload, "Rut voucher that bai."));
        return;
      }

      if (!isVoucherDrawResponse(payload)) {
        setVoucherFeedback("Du lieu voucher khong hop le.");
        return;
      }

      const voucherData = payload;
      if (voucherData.code) {
        setVoucherCode(voucherData.code);
      }
      setVoucherFeedback(voucherData.message ?? "Rut voucher thanh cong.");
    } catch {
      setVoucherFeedback("Khong the ket noi den API voucher.");
    } finally {
      setIsDrawingVoucher(false);
    }
  }

  async function handleCreateOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrderFeedback("");

    const normalizedTable = tableNumber.trim().toUpperCase();
    if (!normalizedTable) {
      setOrderFeedback("Vui long nhap so ban.");
      return;
    }

    if (cartItems.length === 0) {
      setOrderFeedback("Vui long chon it nhat mot mon truoc khi dat.");
      return;
    }

    const payload: OrderCreatePayload = {
      tableNumber: normalizedTable,
      items: cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    const normalizedVoucher = voucherCode.trim().toUpperCase();
    if (normalizedVoucher) {
      payload.voucherCode = normalizedVoucher;
    }

    setIsSubmittingOrder(true);

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      const responsePayload = await parseResponsePayload<OrderResponse>(response);
      if (!response.ok) {
        setOrderFeedback(
          extractErrorMessage(responsePayload, "Dat mon that bai, vui long thu lai.")
        );
        return;
      }

      if (!isOrderResponse(responsePayload)) {
        setOrderFeedback("Du lieu don hang tra ve khong hop le.");
        return;
      }

      const createdOrder = responsePayload;
      setLatestOrder(createdOrder);
      setOrderFeedback(
        `Dat mon thanh cong cho ban ${createdOrder.tableNumber}. Ma don #${createdOrder.orderId}.`
      );
      setCart({});
      setVoucherCode("");
      setVoucherFeedback("");
    } catch {
      setOrderFeedback("Khong the ket noi den API dat mon.");
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  const latestOrderCreatedAt = latestOrder?.createdAt
    ? new Date(latestOrder.createdAt).toLocaleString("vi-VN")
    : "";

  return (
    <div className="space-y-4 pb-10 sm:space-y-5">
      <section className="glass-card pattern-burst fade-up overflow-hidden rounded-3xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-xs uppercase tracking-[0.28em] text-brand">
            MiniOrderSys
          </p>
          <div
            className={hasAdminAccess ? "flex items-center gap-2" : "flex flex-col items-end gap-2"}
          >
            {hasAdminAccess ? (
              <Link
                href="/admin"
                className="rounded-xl border border-border-soft px-3 py-2 text-xs font-semibold text-ink transition hover:bg-paper-strong"
              >
                Admin
              </Link>
            ) : null}
            {isLoggedIn ? (
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
        <h1 className="mt-2 font-display text-3xl leading-tight text-ink">
          Dat mon cafe nhanh tren mobile
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          Dang nhap, chon mon, them voucher va gui don ngay tren mot man hinh.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wider">
          <span className="rounded-full bg-brand/12 px-3 py-1 text-brand">
            Mobile-first
          </span>
          <span className="rounded-full bg-mint/12 px-3 py-1 text-mint">
            Next.js App Router
          </span>
          <span className="rounded-full bg-paper-strong px-3 py-1 text-ink-soft">
            Proxy API qua FE
          </span>
        </div>
      </section>

      <section className="glass-card fade-up rounded-3xl p-4 [animation-delay:70ms] sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg text-ink">Tai khoan</h2>
            <p className="mt-1 text-xs text-ink-soft">
              Dang nhap de su dung voucher va theo doi nguoi dat.
            </p>
          </div>
          {isLoggedIn ? (
            <span className="rounded-full bg-mint/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-mint">
              Da dang nhap
            </span>
          ) : null}
        </div>

        {!isLoggedIn ? (
          <>
            <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl bg-paper/50 p-1">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${authMode === "login"
                  ? "bg-brand text-white"
                  : "text-ink-soft hover:bg-paper-strong"
                  }`}
              >
                Dang nhap
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${authMode === "register"
                  ? "bg-brand text-white"
                  : "text-ink-soft hover:bg-paper-strong"
                  }`}
              >
                Dang ky
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="mt-3 space-y-2">
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-border-soft bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                placeholder="Username"
                autoComplete="username"
              />
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-border-soft bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
                placeholder="Password"
                type="password"
                autoComplete={authMode === "login" ? "current-password" : "new-password"}
              />
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full rounded-2xl bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isAuthenticating
                  ? "Dang xu ly..."
                  : authMode === "login"
                    ? "Dang nhap"
                    : "Tao tai khoan"}
              </button>
            </form>
          </>
        ) : (
          <p className="mt-3 rounded-xl bg-mint/10 px-3 py-2 text-xs font-medium text-mint">
            Ban da dang nhap. Neu can, ban co the dang xuat bang nut o phia tren.
          </p>
        )}

        <p className="mt-2 text-xs font-medium text-ink-soft">
          {isLoggedIn
            ? `Da dang nhap voi tai khoan ${currentUser}.`
            : "Ban chua dang nhap."}
        </p>
        {authFeedback ? (
          <p className="mt-1 text-xs font-medium text-brand">{authFeedback}</p>
        ) : null}
      </section>

      <section className="glass-card fade-up rounded-3xl p-4 [animation-delay:120ms] sm:p-5">
        <h2 className="font-display text-lg text-ink">Thong tin don</h2>
        <p className="mt-1 text-xs text-ink-soft">
          Ban co the dat guest, nhung voucher yeu cau da dang nhap.
        </p>

        <form id="order-form" onSubmit={handleCreateOrder} className="mt-3 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
              So ban
            </span>
            <input
              value={tableNumber}
              onChange={(event) => setTableNumber(event.target.value)}
              className="w-full rounded-2xl border border-border-soft bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand"
              placeholder="Vi du: A1"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
              Ma voucher (tu chon)
            </span>
            <div className="flex gap-2">
              <input
                value={voucherCode}
                onChange={(event) => setVoucherCode(event.target.value)}
                className="flex-1 rounded-2xl border border-border-soft bg-white px-3 py-2.5 text-sm uppercase outline-none transition focus:border-brand"
                placeholder="VD: GIAM20"
              />
              <button
                type="button"
                onClick={handleDrawVoucher}
                disabled={isDrawingVoucher || !isLoggedIn}
                className="rounded-2xl border border-mint/35 bg-mint/10 px-3 py-2 text-xs font-semibold text-mint transition hover:bg-mint/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDrawingVoucher ? "Dang rut..." : "Rut voucher"}
              </button>
            </div>
          </label>

          {voucherFeedback ? (
            <p className="rounded-xl bg-mint/10 px-3 py-2 text-xs font-medium text-mint">
              {voucherFeedback}
            </p>
          ) : null}
        </form>
      </section>

      <section className="fade-up space-y-3 [animation-delay:170ms]">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">Menu hom nay</h2>
          <button
            type="button"
            onClick={reloadProducts}
            disabled={isLoadingProducts}
            className="rounded-xl border border-border-soft px-3 py-2 text-xs font-semibold text-ink transition hover:bg-paper-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingProducts ? "Dang tai..." : "Tai lai"}
          </button>
        </div>

        {productFeedback ? (
          <p className="rounded-xl bg-brand/10 px-3 py-2 text-sm font-medium text-brand">
            {productFeedback}
          </p>
        ) : null}

        {isLoadingProducts ? (
          <div className="space-y-2">
            {[1, 2, 3].map((placeholder) => (
              <div
                key={placeholder}
                className="glass-card h-24 animate-pulse rounded-2xl"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {products.map((product, index) => {
              const quantity = cart[product.id] ?? 0;
              const unitPrice = toMoneyValue(product.price);

              return (
                <article
                  key={product.id}
                  className="glass-card fade-up rounded-2xl p-3"
                  style={{ animationDelay: `${220 + index * 55}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-base text-ink">{product.name}</h3>
                      <p className="mt-1 text-xs leading-5 text-ink-soft">
                        {product.description || "Mon khong co mo ta."}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-brand">{formatVnd(unitPrice)}</p>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wider text-ink-soft">
                      So luong
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => bumpQuantity(product.id, -1)}
                        className="h-8 w-8 rounded-lg border border-border-soft bg-white text-lg leading-none text-ink transition hover:border-brand"
                        aria-label={`Giam so luong ${product.name}`}
                      >
                        -
                      </button>
                      <span className="min-w-7 text-center text-sm font-semibold text-ink">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => bumpQuantity(product.id, 1)}
                        className="h-8 w-8 rounded-lg border border-border-soft bg-white text-lg leading-none text-ink transition hover:border-brand"
                        aria-label={`Tang so luong ${product.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="glass-card fade-up sticky bottom-3 z-20 rounded-3xl p-4 [animation-delay:230ms] sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
          Gio hang
        </p>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-sm text-ink-soft">{cartCount} mon da chon</p>
            <p className="font-display text-2xl text-ink">{formatVnd(subTotal)}</p>
          </div>
          <button
            form="order-form"
            type="submit"
            disabled={isSubmittingOrder || cartCount === 0}
            className="rounded-2xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmittingOrder ? "Dang gui don..." : "Dat mon ngay"}
          </button>
        </div>

        {orderFeedback ? (
          <p className="mt-3 rounded-xl bg-paper-strong px-3 py-2 text-xs font-medium text-ink">
            {orderFeedback}
          </p>
        ) : null}
      </section>

      {latestOrder ? (
        <section className="glass-card fade-up rounded-3xl p-4 [animation-delay:280ms] sm:p-5">
          <h2 className="font-display text-lg text-ink">Don hang vua tao</h2>
          <p className="mt-1 text-xs text-ink-soft">{latestOrderCreatedAt}</p>

          <div className="mt-3 space-y-2 rounded-2xl bg-white/70 p-3">
            <div className="flex justify-between text-sm text-ink">
              <span>Ma don</span>
              <strong>#{latestOrder.orderId}</strong>
            </div>
            <div className="flex justify-between text-sm text-ink">
              <span>Ban</span>
              <strong>{latestOrder.tableNumber}</strong>
            </div>
            <div className="flex justify-between text-sm text-ink">
              <span>Nguoi dat</span>
              <strong>{latestOrder.orderedBy}</strong>
            </div>
            <div className="flex justify-between text-sm text-ink">
              <span>Trang thai</span>
              <strong>{latestOrder.status}</strong>
            </div>
            {toMoneyValue(latestOrder.discountAmount) > 0 ? (
              <div className="flex justify-between text-sm text-mint">
                <span>Giam gia</span>
                <strong>-{formatVnd(toMoneyValue(latestOrder.discountAmount))}</strong>
              </div>
            ) : null}
            <div className="flex justify-between text-sm text-ink">
              <span>Tong thanh toan</span>
              <strong>{formatVnd(toMoneyValue(latestOrder.totalAmount))}</strong>
            </div>
          </div>

          <ul className="mt-3 space-y-2">
            {latestOrder.items.map((item) => (
              <li
                key={`${item.productId}-${item.productName}`}
                className="rounded-xl border border-border-soft bg-white/70 px-3 py-2 text-sm text-ink"
              >
                <div className="flex items-center justify-between gap-2">
                  <span>
                    {item.productName} x{item.quantity}
                  </span>
                  <strong>{formatVnd(toMoneyValue(item.lineTotal))}</strong>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
