import { NextResponse } from "next/server";

import { proxyToBackend, readJsonRequestBody } from "@/lib/backend";

export async function POST(request: Request) {
  const body = await readJsonRequestBody(request);
  if (!body) {
    return NextResponse.json(
      { message: "Payload dang nhap khong hop le." },
      { status: 400 }
    );
  }

  return proxyToBackend({
    method: "POST",
    path: "/api/auth/login",
    body,
  });
}
