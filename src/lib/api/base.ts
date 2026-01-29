import { logger } from "@/lib/utils/logger";
import type { ApiError, ApiResult } from "@/types/api";

interface FetchOptions extends RequestInit {
    timeout?: number;
    retries?: number;
    token?: string;
    responseType?: "json" | "blob";
}

const DEFAULT_TIMEOUT = 15000;
const DEFAULT_RETRIES = 3;
const RATE_LIMIT_MS = 1000;

let lastRequestTime = 0;

async function enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - lastRequestTime;

    if (elapsed < RATE_LIMIT_MS) {
        await new Promise((resolve) =>
            setTimeout(resolve, RATE_LIMIT_MS - elapsed),
        );
    }

    lastRequestTime = Date.now();
}

function isRetriableError(status: number): boolean {
    return status >= 500 || status === 429;
}

export async function apiFetch<T>(
    url: string,
    options: FetchOptions = {},
): Promise<ApiResult<T>> {
    // Skip API calls during build if URL contains placeholder (from env.ts)
    if (url.includes("__") || url.startsWith("__")) {
        return {
            success: false,
            error: {
                message: "API URL not configured (build-time placeholder)",
                status: 0,
            },
        };
    }

    const {
        timeout = DEFAULT_TIMEOUT,
        retries = DEFAULT_RETRIES,
        token,
        headers = {},
        responseType = "json",
        ...fetchOptions
    } = options;

    const requestHeaders: Record<string, string> = {
        ...(headers as Record<string, string>),
    };

    // Only set Content-Type for JSON requests
    if (responseType === "json" && !requestHeaders["Content-Type"]) {
        requestHeaders["Content-Type"] = "application/json";
    }

    if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        let timeoutTriggered = false;
        const timeoutMs = timeout * 2 ** (attempt - 1);
        try {
            await enforceRateLimit();

            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                timeoutTriggered = true;
                controller.abort();
            }, timeoutMs);

            const response = await fetch(url, {
                ...fetchOptions,
                headers: requestHeaders,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                if (attempt < retries && isRetriableError(response.status)) {
                    const retryAfter = response.headers.get("Retry-After");
                    const delayMs = retryAfter
                        ? Number.parseInt(retryAfter) * 1000
                        : 2 ** attempt * 1000;

                    logger.warn(
                        `API error ${response.status}, retrying (${attempt}/${retries})`,
                        "apiFetch",
                    );

                    await new Promise((resolve) =>
                        setTimeout(resolve, delayMs),
                    );
                    continue;
                }

                const error: ApiError = {
                    message: `HTTP ${response.status}: ${response.statusText}`,
                    status: response.status,
                };

                return { success: false, error };
            }

            // Handle different response types
            const data =
                responseType === "blob"
                    ? ((await response.blob()) as T)
                    : ((await response.json()) as T);
            return { success: true, data };
        } catch (error) {
            const isAbortError =
                error instanceof Error && error.name === "AbortError";
            const isTimeout = timeoutTriggered && isAbortError;

            if (attempt < retries) {
                const errorMessage = isTimeout
                    ? `Request timeout (${timeoutMs}ms), retrying (${attempt}/${retries})`
                    : `Request failed, retrying (${attempt}/${retries})`;
                logger.warn(errorMessage, "apiFetch", {
                    url,
                    attempt,
                    retries,
                });
                await new Promise((resolve) =>
                    setTimeout(resolve, 2 ** attempt * 1000),
                );
                continue;
            }

            const apiError: ApiError = {
                message: isTimeout
                    ? `Request timeout after ${timeoutMs}ms (${retries} attempts)`
                    : isAbortError
                      ? "Request was cancelled"
                      : error instanceof Error
                        ? error.message
                        : "Unknown error",
                status: 0,
            };

            // Log timeout errors as warnings since they're expected in some scenarios
            // Also log AbortErrors as warnings in server-side context (common during SSR/navigation)
            if (isTimeout || (isAbortError && typeof window === "undefined")) {
                logger.warn(
                    `API request aborted: ${apiError.message}`,
                    "apiFetch",
                    { url, isTimeout },
                );
            } else {
                logger.error(
                    `API request failed: ${apiError.message}`,
                    "apiFetch",
                    { url },
                );
            }

            return { success: false, error: apiError };
        }
    }

    return {
        success: false,
        error: { message: "Max retries exceeded", status: 0 },
    };
}
