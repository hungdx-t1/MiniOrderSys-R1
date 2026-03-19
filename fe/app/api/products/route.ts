import { proxyToBackend } from "@/app/_lib/backend";

export async function GET() {
  return proxyToBackend({
    method: "GET",
    path: "/api/products",
  });
}
