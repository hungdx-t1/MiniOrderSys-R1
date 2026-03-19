import { NextResponse } from "next/server";

import {
  getAuthTokenFromRequest,
  proxyToBackend,
  readJsonRequestBody,
} from "@/app/_lib/backend";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function missingTokenResponse() {
  return NextResponse.json(
    { message: "Can dang nhap admin de thao tac." },
    { status: 401 }
  );
}

export async function PUT(request: Request, context: RouteContext) {
  const token = getAuthTokenFromRequest(request);
  if (!token) {
    return missingTokenResponse();
  }

  const body = await readJsonRequestBody(request);
  if (!body) {
    return NextResponse.json(
      { message: "Payload do uong khong hop le." },
      { status: 400 }
    );
  }

  const { id } = await context.params;

  return proxyToBackend({
    method: "PUT",
    path: `/api/admin/products/${id}`,
    body,
    token,
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  const token = getAuthTokenFromRequest(request);
  if (!token) {
    return missingTokenResponse();
  }

  const { id } = await context.params;

  return proxyToBackend({
    method: "DELETE",
    path: `/api/admin/products/${id}`,
    token,
  });
}
