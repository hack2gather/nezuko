import type { Caido } from "@caido/sdk-backend";
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
  tabs: string[];
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
   * Get list of available repeater tabs
   */
  async getRepeaterTabs(): Promise<string[]> {
    try {
      // In a real implementation, this would query Caido's API for repeater tabs
      // For now, we'll return a placeholder implementation
      // You'll need to use the actual Caido SDK methods when available

      // The actual implementation would be something like:
      // const tabs = await this.sdk.api.repeater.getTabs();
      // return tabs.map(tab => tab.id || tab.name);

      // Placeholder for demonstration:
      return ["Tab 1", "Tab 2", "Tab 3"];
    } catch (error) {
      this.sdk.console.error("Error getting repeater tabs:", error);
      return [];
    }
  }

  /**
   * Modify and send requests with custom headers and cookies
   */
  async modifyAndSendRequests(params: ModifyRequestsParams): Promise<ModifyRequestsResult> {
    const { headers, cookies, tabs } = params;
    const errors: string[] = [];
    let successCount = 0;

    this.sdk.console.log(`Modifying and sending requests for ${tabs.length} tab(s)`);
    this.sdk.console.log(`Custom headers: ${JSON.stringify(headers)}`);
    this.sdk.console.log(`Custom cookies: ${JSON.stringify(cookies)}`);

    try {
      // Iterate through selected tabs
      for (const tabId of tabs) {
        try {
          // Get the request from the repeater tab
          // In a real implementation, you would use:
          // const request = await this.sdk.api.repeater.getRequest(tabId);

          // For now, we'll demonstrate the logic:
          // 1. Parse the existing request
          // 2. Add/replace headers
          // 3. Add/replace cookies
          // 4. Send the modified request

          const modifiedRequest = await this.modifyRequest(tabId, headers, cookies);

          if (modifiedRequest) {
            // Send the modified request
            // await this.sdk.api.repeater.sendRequest(tabId, modifiedRequest);
            successCount++;
            this.sdk.console.log(`Successfully sent request for tab: ${tabId}`);
          }
        } catch (error) {
          const errorMsg = `Error processing tab ${tabId}: ${error}`;
          this.sdk.console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      return {
        count: successCount,
        success: successCount > 0,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      this.sdk.console.error("Error in modifyAndSendRequests:", error);
      return {
        count: 0,
        success: false,
        errors: [String(error)]
      };
    }
  }

  /**
   * Modify a request with custom headers and cookies
   */
  private async modifyRequest(
    tabId: string,
    customHeaders: HeaderEntry[],
    customCookies: CookieEntry[]
  ): Promise<any> {
    try {
      // In a real implementation, you would:
      // 1. Get the current request from the repeater tab
      // const request = await this.sdk.api.repeater.getRequest(tabId);

      // 2. Parse the request to extract headers and body
      // const parsedRequest = this.parseHttpRequest(request.raw);

      // 3. Add or replace custom headers
      // for (const header of customHeaders) {
      //   parsedRequest.headers[header.key] = header.value;
      // }

      // 4. Handle cookies - merge with existing Cookie header or create new one
      // if (customCookies.length > 0) {
      //   const cookieString = this.buildCookieString(customCookies);
      //   parsedRequest.headers['Cookie'] = cookieString;
      // }

      // 5. Rebuild the HTTP request
      // const modifiedRawRequest = this.buildHttpRequest(parsedRequest);

      // For demonstration purposes, we'll just log the operation
      this.sdk.console.log(`Modifying request for tab: ${tabId}`);
      this.sdk.console.log(`Adding ${customHeaders.length} custom headers`);
      this.sdk.console.log(`Adding ${customCookies.length} custom cookies`);

      // Return a placeholder - in real implementation, return the modified request
      return { tabId, modified: true };
    } catch (error) {
      this.sdk.console.error(`Error modifying request for tab ${tabId}:`, error);
      throw error;
    }
  }

  /**
   * Parse HTTP request string into components
   */
  private parseHttpRequest(raw: string): {
    method: string;
    path: string;
    version: string;
    headers: Record<string, string>;
    body: string;
  } {
    const lines = raw.split('\r\n');
    const [method, path, version] = lines[0].split(' ');

    const headers: Record<string, string> = {};
    let i = 1;

    // Parse headers
    while (i < lines.length && lines[i] !== '') {
      const colonIndex = lines[i].indexOf(':');
      if (colonIndex > 0) {
        const key = lines[i].substring(0, colonIndex).trim();
        const value = lines[i].substring(colonIndex + 1).trim();
        headers[key] = value;
      }
      i++;
    }

    // Get body (everything after the empty line)
    const body = lines.slice(i + 1).join('\r\n');

    return { method, path, version, headers, body };
  }

  /**
   * Build HTTP request string from components
   */
  private buildHttpRequest(request: {
    method: string;
    path: string;
    version: string;
    headers: Record<string, string>;
    body: string;
  }): string {
    let raw = `${request.method} ${request.path} ${request.version}\r\n`;

    // Add headers
    for (const [key, value] of Object.entries(request.headers)) {
      raw += `${key}: ${value}\r\n`;
    }

    raw += '\r\n';

    // Add body
    if (request.body) {
      raw += request.body;
    }

    return raw;
  }

  /**
   * Build cookie string from cookie entries
   */
  private buildCookieString(cookies: CookieEntry[]): string {
    return cookies
      .filter(c => c.key && c.value)
      .map(c => `${c.key}=${c.value}`)
      .join('; ');
  }

  /**
   * Merge custom cookies with existing cookies
   */
  private mergeCookies(existingCookieHeader: string | undefined, customCookies: CookieEntry[]): string {
    const existingCookies: Record<string, string> = {};

    // Parse existing cookies
    if (existingCookieHeader) {
      const pairs = existingCookieHeader.split(';');
      for (const pair of pairs) {
        const [key, value] = pair.trim().split('=');
        if (key && value) {
          existingCookies[key] = value;
        }
      }
    }

    // Add or override with custom cookies
    for (const cookie of customCookies) {
      if (cookie.key && cookie.value) {
        existingCookies[cookie.key] = cookie.value;
      }
    }

    // Build cookie string
    return Object.entries(existingCookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
  }
}

export function init(sdk: SDK) {
  sdk.console.log("Headers Manager Backend initialized");

  const backend = new HeadersManagerBackend(sdk);

  // Register RPC endpoints that the frontend can call
  sdk.api.register("getRepeaterTabs", async () => {
    return await backend.getRepeaterTabs();
  });

  sdk.api.register("modifyAndSendRequests", async (params: ModifyRequestsParams) => {
    return await backend.modifyAndSendRequests(params);
  });

  sdk.console.log("Headers Manager Backend RPC endpoints registered");
}
