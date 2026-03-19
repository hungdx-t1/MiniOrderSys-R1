import { NextResponse } from "next/server";

import { getAuthTokenFromRequest, proxyToBackend } from "@/app/_lib/backend";

export async function POST(request: Request) {
  const token = getAuthTokenFromRequest(request);
  if (!token) {
    return NextResponse.json(
      { message: "Can dang nhap de rut voucher." },
      { status: 401 }
    );
  }

  return proxyToBackend({
    method: "POST",
    path: "/api/vouchers/draw",
    token,
  });
}
