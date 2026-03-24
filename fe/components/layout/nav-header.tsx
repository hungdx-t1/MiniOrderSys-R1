"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Coffee, User, LogOut, Settings, ChevronDown, ShoppingCart, History } from "lucide-react";

export default function NavHeader() {
  const { user, isLoggedIn, logout, hasHydrated: authHydrated } = useAuth();
  const { cartCount, hasHydrated: cartHydrated, setIsCartOpen } = useCart();

  const hasHydrated = authHydrated && cartHydrated;

  if (!hasHydrated) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <Coffee className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight hidden sm:inline-block">
              MiniOrder<span className="text-primary">Sys</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm animate-in zoom-in duration-300">
                {cartCount}
              </span>
            )}
          </Button>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              {user?.role === "ADMIN" && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="hidden gap-2 md:flex">
                    <Settings className="h-4 w-4" />
                    Quản trị
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline" className="h-10 gap-2 rounded-full border-2 border-primary/10 p-1 sm:pl-2 sm:pr-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="hidden max-w-25 truncate text-sm font-semibold sm:inline-block">
                        {user?.username}
                      </span>
                      <ChevronDown className="h-3 w-3 opacity-50 hidden sm:block" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-normal text-muted-foreground uppercase tracking-widest">
                      Tài khoản
                    </DropdownMenuLabel>
                    <div className="flex flex-col gap-1 px-2 py-1.5">
                      <p className="text-sm font-bold">{user?.username}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={user?.role === "ADMIN" ? "default" : "secondary"} className="h-5 px-1.5 text-[10px]">
                          {user?.role}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  {user?.role === "ADMIN" && (
                    <Link href="/admin">
                      <DropdownMenuItem className="cursor-pointer rounded-lg">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Trang quản trị</span>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <Link href="/history">
                    <DropdownMenuItem className="cursor-pointer rounded-lg">
                      <History className="mr-2 h-4 w-4" />
                      <span>Lịch sử đặt món</span>
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem className="cursor-pointer rounded-lg text-rose-600 focus:bg-rose-50 focus:text-rose-600 font-bold" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/login">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full border-2 border-border px-3 text-xs font-semibold bg-background hover:bg-muted sm:h-9 sm:px-3.5"
                >
                  Đăng nhập
                </Button>
              </Link>
              <span className="text-xs font-semibold text-muted-foreground/80">/</span>
              <Link href="/register">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-full border-2 border-primary/40 bg-primary/5 px-3 text-xs font-bold text-primary hover:bg-primary/10 sm:h-9 sm:px-3.5"
                >
                  Đăng ký
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
