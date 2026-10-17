export type ApiErrorBody = {
  error?: { code?: string; message?: string; requestId?: string };
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;

  constructor(status: number, message: string, code = "API_ERROR", requestId?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

export class ApiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiConfigurationError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  authenticated?: boolean;
};

const API_PREFIX = "/api/v1";

function getApiBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (!configured) {
    throw new ApiConfigurationError(
      "API is not configured. Set EXPO_PUBLIC_API_BASE_URL to the backend origin."
    );
  }

  const normalized = configured.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(normalized)) {
    throw new ApiConfigurationError("EXPO_PUBLIC_API_BASE_URL must be an absolute HTTP(S) URL.");
  }
  return normalized;
}

export class ApiClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { body, authenticated = true, headers: suppliedHeaders, ...init } = options;
    const headers = new Headers(suppliedHeaders);
    headers.set("Accept", "application/json");
    if (body !== undefined) headers.set("Content-Type", "application/json");

    if (authenticated) {
      if (!this.accessToken) {
        throw new ApiError(401, "Authentication is required for this request.", "UNAUTHENTICATED");
      }
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    } else {
      headers.delete("Authorization");
    }

    let response: Response;
    try {
      response = await fetch(`${getApiBaseUrl()}${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`, {
        ...init,
        headers,
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch {
      throw new ApiError(0, "Unable to reach the server. Check your connection and try again.", "NETWORK_ERROR");
    }

    if (response.status === 204) return undefined as T;

    const contentType = response.headers.get("content-type") ?? "";
    let payload: unknown;
    if (contentType.includes("application/json")) {
      try {
        payload = await response.json();
      } catch {
        throw new ApiError(response.status, "The server returned an unreadable response.", "INVALID_RESPONSE");
      }
    } else {
      const text = await response.text().catch(() => "");
      payload = text ? { message: text } : undefined;
    }

    if (!response.ok) {
      const envelope = payload as ApiErrorBody | undefined;
      const error = envelope?.error;
      const fallbackMessage =
        typeof (payload as { message?: unknown } | undefined)?.message === "string"
          ? (payload as { message: string }).message
          : `Request failed with status ${response.status}.`;
      throw new ApiError(
        response.status,
        error?.message ?? fallbackMessage,
        error?.code ?? (response.status === 401 ? "UNAUTHENTICATED" : "API_ERROR"),
        error?.requestId
      );
    }

    return payload as T;
  }

  get<T>(path: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  delete<T>(path: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
