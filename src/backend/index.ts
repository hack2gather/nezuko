import type { SDK } from "caido:plugin";

interface HeaderEntry {
  key: string;
  value: string;
}

interface CookieEntry {
  key: string;
  value: string;
}

interface RequestInfo {
  id: string;
  method: string;
  url: string;
  host: string;
  path: string;
  statusCode: number;
}

interface SendSelectedParams {
  headers: HeaderEntry[];
  cookies: CookieEntry[];
  requestIds: string[];
}

interface RequestResult {
  requestId: string;
  originalUrl: string;
  success: boolean;
  statusCode?: number;
  response?: {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  };
  error?: string;
}

interface SendSelectedResult {
  results: RequestResult[];
  successCount: number;
  failCount: number;
}

export class HeadersManagerBackend {
  private sdk: SDK;
  private queuedRequests: RequestInfo[] = [];

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  /**
   * Add requests to the queue from HTTP History context menu
   */
  async addRequestsToQueue(requestIds: string[]): Promise<RequestInfo[]> {
    this.sdk.console.log(`Adding ${requestIds.length} requests to queue`);

    for (const requestId of requestIds) {
      try {
        const request = await this.sdk.requests.get(requestId);
        if (!request) continue;

        const spec = request.toSpec();
        const protocol = spec.getTls() ? "https" : "http";
        const port = spec.getPort() === (spec.getTls() ? 443 : 80) ? "" : `:${spec.getPort()}`;
        const url = `${protocol}://${spec.getHost()}${port}${spec.getPath()}`;

        // Get status code if available
        let statusCode = 0;
        try {
          const response = request.getResponse();
          if (response) {
            statusCode = response.getCode();
          }
        } catch (e) {
          // Response might not be available
        }

        const requestInfo: RequestInfo = {
          id: requestId,
          method: spec.getMethod(),
          url: url,
          host: spec.getHost(),
          path: spec.getPath(),
          statusCode: statusCode
        };

        // Add to queue if not already there
        if (!this.queuedRequests.some(r => r.id === requestId)) {
          this.queuedRequests.push(requestInfo);
        }
      } catch (error) {
        this.sdk.console.error(`Error processing request ${requestId}:`, error);
      }
    }

    this.sdk.console.log(`Queue now has ${this.queuedRequests.length} requests`);
    return this.queuedRequests;
  }

  /**
   * Get queued requests
   */
  async getQueuedRequests(): Promise<RequestInfo[]> {
    return this.queuedRequests;
  }

  /**
   * Clear queued requests
   */
  async clearQueue(): Promise<void> {
    this.queuedRequests = [];
    this.sdk.console.log("Queue cleared");
  }

  /**
   * Remove specific request from queue
   */
  async removeFromQueue(requestId: string): Promise<RequestInfo[]> {
    this.queuedRequests = this.queuedRequests.filter(r => r.id !== requestId);
    this.sdk.console.log(`Removed request ${requestId} from queue`);
    return this.queuedRequests;
  }

  /**
   * Send selected requests with custom headers and cookies
   */
  async sendSelectedRequests(params: SendSelectedParams): Promise<SendSelectedResult> {
    const { headers, cookies, requestIds } = params;
    const results: RequestResult[] = [];
    let successCount = 0;
    let failCount = 0;

    this.sdk.console.log(`Sending ${requestIds.length} selected requests`);
    this.sdk.console.log(`Custom headers: ${JSON.stringify(headers)}`);
    this.sdk.console.log(`Custom cookies: ${JSON.stringify(cookies)}`);

    for (const requestId of requestIds) {
      try {
        // Get the original request by ID
        const originalRequest = await this.sdk.requests.get(requestId);

        if (!originalRequest) {
          results.push({
            requestId,
            originalUrl: "Unknown",
            success: false,
            error: "Request not found"
          });
          failCount++;
          continue;
        }

        // Convert to mutable spec
        const spec = originalRequest.toSpec();

        // Apply custom headers
        for (const header of headers) {
          if (header.key && header.value) {
            spec.setHeader(header.key, header.value);
            this.sdk.console.log(`Setting header: ${header.key}: ${header.value}`);
          }
        }

        // Build and apply Cookie header
        if (cookies.length > 0) {
          const cookieString = cookies
            .filter(c => c.key && c.value)
            .map(c => `${c.key}=${c.value}`)
            .join('; ');

          if (cookieString) {
            spec.setHeader('Cookie', cookieString);
            this.sdk.console.log(`Setting Cookie: ${cookieString}`);
          }
        }

        // Send the modified request
        this.sdk.console.log(`Sending request: ${spec.getHost()}${spec.getPath()}`);
        const sentRequest = await this.sdk.requests.send(spec);

        const protocol = spec.getTls() ? "https" : "http";
        const port = spec.getPort() === (spec.getTls() ? 443 : 80) ? "" : `:${spec.getPort()}`;
        const originalUrl = `${protocol}://${spec.getHost()}${port}${spec.getPath()}`;

        if (sentRequest.response) {
          // Extract response data
          const statusCode = sentRequest.response.getCode();
          const responseBody = sentRequest.response.getBody()?.toText() || "";

          // Get response headers
          const responseHeaders: Record<string, string> = {};
          const headersList = sentRequest.response.getHeaders();
          if (headersList) {
            for (const header of headersList) {
              responseHeaders[header.getKey()] = header.getValue();
            }
          }

          results.push({
            requestId,
            originalUrl,
            success: true,
            statusCode,
            response: {
              statusCode,
              headers: responseHeaders,
              body: responseBody
            }
          });
          successCount++;
          this.sdk.console.log(`✓ Request ${requestId} succeeded with status ${statusCode}`);
        } else {
          results.push({
            requestId,
            originalUrl,
            success: false,
            error: "No response received"
          });
          failCount++;
          this.sdk.console.log(`✗ Request ${requestId} failed: No response`);
        }
      } catch (error) {
        const errorMsg = String(error);
        this.sdk.console.error(`Error processing request ${requestId}:`, error);
        results.push({
          requestId,
          originalUrl: "Error",
          success: false,
          error: errorMsg
        });
        failCount++;
      }
    }

    this.sdk.console.log(`Completed: ${successCount} succeeded, ${failCount} failed`);

    return {
      results,
      successCount,
      failCount
    };
  }
}

export function init(sdk: SDK) {
  sdk.console.log("Headers Manager Backend initialized");

  const backend = new HeadersManagerBackend(sdk);

  // Register RPC endpoints
  sdk.api.register("addRequestsToQueue", async (requestIds: string[]) => {
    return await backend.addRequestsToQueue(requestIds);
  });

  sdk.api.register("getQueuedRequests", async () => {
    return await backend.getQueuedRequests();
  });

  sdk.api.register("clearQueue", async () => {
    return await backend.clearQueue();
  });

  sdk.api.register("removeFromQueue", async (requestId: string) => {
    return await backend.removeFromQueue(requestId);
  });

  sdk.api.register("sendSelectedRequests", async (params: SendSelectedParams) => {
    return await backend.sendSelectedRequests(params);
  });

  sdk.console.log("Headers Manager Backend RPC endpoints registered");
}
