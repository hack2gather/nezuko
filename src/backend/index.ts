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

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  /**
   * Get HTTP history requests
   */
  async getHttpHistory(searchQuery?: string): Promise<RequestInfo[]> {
    try {
      this.sdk.console.log("Fetching HTTP history...");

      // Get requests from HTTP history
      // Using the SDK's requests/findings API
      const requests: RequestInfo[] = [];

      // Query the database for HTTP requests
      // Note: This uses Caido's internal GraphQL API
      const query = `
        query GetRequests($limit: Int!, $filter: HTTPQL) {
          httpHistory {
            requests(limit: $limit, order: {by: ID, ordering: DESC}, filter: $filter) {
              nodes {
                id
                method
                host
                path
                port
                tls
                response {
                  statusCode
                }
              }
            }
          }
        }
      `;

      const variables = {
        limit: 100,
        filter: searchQuery || null
      };

      try {
        const result = await this.sdk.api.graphql(query, variables);

        if (result.data?.httpHistory?.requests?.nodes) {
          for (const node of result.data.httpHistory.requests.nodes) {
            const protocol = node.tls ? "https" : "http";
            const port = node.port === (node.tls ? 443 : 80) ? "" : `:${node.port}`;
            const url = `${protocol}://${node.host}${port}${node.path}`;

            requests.push({
              id: node.id,
              method: node.method,
              url: url,
              host: node.host,
              path: node.path,
              statusCode: node.response?.statusCode || 0
            });
          }
        }
      } catch (error) {
        this.sdk.console.error("GraphQL query error:", error);
      }

      this.sdk.console.log(`Found ${requests.length} requests`);
      return requests;
    } catch (error) {
      this.sdk.console.error("Error getting HTTP history:", error);
      return [];
    }
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
  sdk.api.register("getHttpHistory", async (searchQuery?: string) => {
    return await backend.getHttpHistory(searchQuery);
  });

  sdk.api.register("sendSelectedRequests", async (params: SendSelectedParams) => {
    return await backend.sendSelectedRequests(params);
  });

  sdk.console.log("Headers Manager Backend RPC endpoints registered");
}
