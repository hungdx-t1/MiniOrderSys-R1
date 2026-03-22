import { proxyToBackend } from "@/lib/backend";

export async function GET() {
  return proxyToBackend({
    method: "GET",
    path: "/api/tables",
  });
}
