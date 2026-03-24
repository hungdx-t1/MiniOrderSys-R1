import { NextResponse } from "next/server";

import { getAuthTokenFromRequest, proxyToBackend } from "@/lib/backend";

export async function GET(request: Request) {
  const token = getAuthTokenFromRequest(request);
  if (!token) {
    return NextResponse.json(
      { message: "Can dang nhap de xem voucher cua ban." },
      { status: 401 }
    );
  }

  return proxyToBackend({
    method: "GET",
    path: "/api/vouchers/my",
    token,
  });
}
