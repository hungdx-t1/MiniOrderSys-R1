import { NextRequest } from "next/server";
import { proxyToBackend, getAuthTokenFromRequest } from "@/lib/backend";

export async function GET(request: NextRequest) {
  const token = getAuthTokenFromRequest(request);
  return await proxyToBackend({
    method: "GET",
    path: "/api/admin/invoices",
    token,
  });
}
