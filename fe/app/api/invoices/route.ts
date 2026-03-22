import { NextRequest } from "next/server";
import { proxyToBackend, readJsonRequestBody, getAuthTokenFromRequest } from "@/lib/backend";

/**
 * Xử lý hóa đơn (Checkout)
 */
export async function POST(request: NextRequest) {
  const body = await readJsonRequestBody(request);
  const token = getAuthTokenFromRequest(request);

  return await proxyToBackend({
    method: "POST",
    path: "/api/invoices",
    body,
    token,
  });
}
