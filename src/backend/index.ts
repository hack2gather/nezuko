import type { SDK } from "caido:plugin";

interface HeaderEntry {
  key: string;
  value: string;
}

interface CookieEntry {
  key: string;
  value: string;
}

interface ModifyRequestsParams {
  headers: HeaderEntry[];
  cookies: CookieEntry[];
  requestSpec: any; // Caido request specification
}

interface ModifyRequestsResult {
  count: number;
  success: boolean;
  errors?: string[];
}

export class HeadersManagerBackend {
  private sdk: SDK;

  constructor(sdk: SDK) {
    this.sdk = sdk;
  }

  /**
   * Send a request with custom headers and cookies
   */
  async sendRequestWithHeaders(params: ModifyRequestsParams): Promise<ModifyRequestsResult> {
    const { headers, cookies, requestSpec } = params;
    const errors: string[] = [];
    let successCount = 0;

    this.sdk.console.log(`Sending request with custom headers and cookies`);
    this.sdk.console.log(`Custom headers: ${JSON.stringify(headers)}`);
    this.sdk.console.log(`Custom cookies: ${JSON.stringify(cookies)}`);

    try {
      // Build headers object
      const customHeaders: Record<string, string> = {};

      // Add custom headers
      for (const header of headers) {
        if (header.key && header.value) {
          customHeaders[header.key] = header.value;
        }
      }

      // Build cookie header
      if (cookies.length > 0) {
        const cookieString = cookies
          .filter(c => c.key && c.value)
          .map(c => `${c.key}=${c.value}`)
          .join('; ');

        if (cookieString) {
          customHeaders['Cookie'] = cookieString;
        }
      }

      // Send HTTP request using Caido's SDK
      try {
        const response = await this.sdk.api.send({
          request: {
            method: requestSpec.method || 'GET',
            url: requestSpec.url,
            headers: customHeaders,
            body: requestSpec.body || undefined
          }
        });

        this.sdk.console.log(`Request sent successfully. Status: ${response.response.statusCode}`);
        successCount = 1;
      } catch (error) {
        const errorMsg = `Error sending request: ${error}`;
        this.sdk.console.error(errorMsg);
        errors.push(errorMsg);
      }

      return {
        count: successCount,
        success: successCount > 0,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      this.sdk.console.error("Error in sendRequestWithHeaders:", error);
      return {
        count: 0,
        success: false,
        errors: [String(error)]
      };
    }
  }

  /**
   * Get stored headers and cookies
   */
  async getStoredData(): Promise<{ headers: HeaderEntry[]; cookies: CookieEntry[] }> {
    try {
      // Caido SDK provides storage through the database
      // For now, return empty arrays - frontend will handle storage
      return {
        headers: [],
        cookies: []
      };
    } catch (error) {
      this.sdk.console.error("Error getting stored data:", error);
      return { headers: [], cookies: [] };
    }
  }
}

export function init(sdk: SDK) {
  sdk.console.log("Headers Manager Backend initialized");

  const backend = new HeadersManagerBackend(sdk);

  // Register RPC endpoints that the frontend can call
  sdk.api.register("sendRequestWithHeaders", async (params: ModifyRequestsParams) => {
    return await backend.sendRequestWithHeaders(params);
  });

  sdk.api.register("getStoredData", async () => {
    return await backend.getStoredData();
  });

  sdk.console.log("Headers Manager Backend RPC endpoints registered");
}
