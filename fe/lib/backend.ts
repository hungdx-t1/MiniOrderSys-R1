import { NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BE_API_BASE_URL ?? "http://localhost:8080";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ProxyOptions {
  method: HttpMethod;
  path: string;
  body?: unknown;
  token?: string | null;
}

function buildBackendUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BACKEND_BASE_URL}${normalizedPath}`;
}

async function parseBackendBody(response: Response) {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { message: text };
  }
}

export async function proxyToBackend(options: ProxyOptions) {
  try {
    const headers: HeadersInit = {
      Accept: "application/json",
    };

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    if (options.token) {
      headers.Authorization = options.token.startsWith("Bearer ")
        ? options.token
        : `Bearer ${options.token}`;
    }

    const response = await fetch(buildBackendUrl(options.path), {
      method: options.method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: "no-store",
    });

    const payload = await parseBackendBody(response);

    if (payload === null) {
      return new NextResponse(null, { status: response.status });
    }

    return NextResponse.json(payload, { status: response.status });
  } catch {
    return NextResponse.json(
      {
        message: "Khong the ket noi den BE. Vui long bat Spring Boot server.",
      },
      { status: 502 }
    );
  }
}

export async function readJsonRequestBody(request: Request) {
  try {
    return (await request.json()) as unknown;
  } catch {
    return null;
  }
}

export function getAuthTokenFromRequest(request: Request) {
  return request.headers.get("authorization") ?? request.headers.get("Authorization");
}
