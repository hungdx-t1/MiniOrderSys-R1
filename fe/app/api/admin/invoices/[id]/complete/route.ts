import { NextRequest } from "next/server";
import { proxyToBackend, getAuthTokenFromRequest } from "@/lib/backend";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = getAuthTokenFromRequest(request);
  const { id } = params;

  return await proxyToBackend({
    method: "PUT",
    path: `/api/admin/invoices/${id}/complete`,
    token,
  });
}
