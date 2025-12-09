import type { Caido } from "@caido/sdk-frontend";
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

interface HeaderEntry {
  key: string;
  value: string;
}

interface CookieEntry {
  key: string;
  value: string;
}

interface StoredData {
  headers: HeaderEntry[];
  cookies: CookieEntry[];
}

const HeadersSidebar = ({ caido }: { caido: Caido }) => {
  const [headers, setHeaders] = useState<HeaderEntry[]>([{ key: "", value: "" }]);
  const [cookies, setCookies] = useState<CookieEntry[]>([{ key: "", value: "" }]);
  const [url, setUrl] = useState<string>("");
  const [method, setMethod] = useState<string>("GET");
  const [body, setBody] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string>("");

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const data = await caido.storage.get("headers-cookies-data");
      if (data) {
        const parsed: StoredData = JSON.parse(data);
        if (parsed.headers && parsed.headers.length > 0) {
          setHeaders(parsed.headers);
        }
        if (parsed.cookies && parsed.cookies.length > 0) {
          setCookies(parsed.cookies);
        }
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
  };

  const handleSave = async () => {
    try {
      // Filter out empty entries
      const validHeaders = headers.filter(h => h.key.trim() !== "" || h.value.trim() !== "");
      const validCookies = cookies.filter(c => c.key.trim() !== "" || c.value.trim() !== "");

      const dataToSave: StoredData = {
        headers: validHeaders.length > 0 ? validHeaders : [{ key: "", value: "" }],
        cookies: validCookies.length > 0 ? validCookies : [{ key: "", value: "" }]
      };

      await caido.storage.set("headers-cookies-data", JSON.stringify(dataToSave));
      setStatusMessage("✓ Saved successfully!");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      console.error("Error saving data:", error);
      setStatusMessage("✗ Error saving data");
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  const handleSendRequest = async () => {
    if (!url.trim()) {
      setStatusMessage("✗ Please enter a URL");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    try {
      setStatusMessage("Sending request...");

      // Filter out empty entries
      const validHeaders = headers.filter(h => h.key.trim() !== "" && h.value.trim() !== "");
      const validCookies = cookies.filter(c => c.key.trim() !== "" && c.value.trim() !== "");

      const result = await caido.backend.sendRequestWithHeaders({
        headers: validHeaders,
        cookies: validCookies,
        requestSpec: {
          method,
          url,
          body: body || undefined
        }
      });

      if (result.success) {
        setStatusMessage(`✓ Request sent successfully!`);
      } else {
        setStatusMessage(`✗ Request failed: ${result.errors?.join(", ")}`);
      }
      setTimeout(() => setStatusMessage(""), 5000);
    } catch (error) {
      console.error("Error sending request:", error);
      setStatusMessage(`✗ Error: ${error}`);
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  const addHeaderRow = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeaderRow = (index: number) => {
    if (headers.length > 1) {
      setHeaders(headers.filter((_, i) => i !== index));
    }
  };

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addCookieRow = () => {
    setCookies([...cookies, { key: "", value: "" }]);
  };

  const removeCookieRow = (index: number) => {
    if (cookies.length > 1) {
      setCookies(cookies.filter((_, i) => i !== index));
    }
  };

  const updateCookie = (index: number, field: "key" | "value", value: string) => {
    const newCookies = [...cookies];
    newCookies[index][field] = value;
    setCookies(newCookies);
  };

  return (
    <div style={{ padding: "16px", fontFamily: "system-ui, -apple-system, sans-serif", maxWidth: "100%", height: "100%" }}>
      <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "18px" }}>Headers & Cookies Manager</h2>

      {/* Status Message */}
      {statusMessage && (
        <div style={{
          padding: "8px 12px",
          marginBottom: "16px",
          backgroundColor: statusMessage.startsWith("✓") ? "#d4edda" : "#f8d7da",
          color: statusMessage.startsWith("✓") ? "#155724" : "#721c24",
          borderRadius: "4px",
          fontSize: "14px"
        }}>
          {statusMessage}
        </div>
      )}

      {/* Request Configuration */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Request Configuration</h3>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
            Method
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
            <option value="OPTIONS">OPTIONS</option>
            <option value="HEAD">HEAD</option>
          </select>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
            URL
          </label>
          <input
            type="text"
            placeholder="https://example.com/api/endpoint"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
            Body (optional)
          </label>
          <textarea
            placeholder='{"key": "value"}'
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
              fontFamily: "monospace",
              boxSizing: "border-box",
              resize: "vertical"
            }}
          />
        </div>
      </div>

      {/* Headers Section */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Custom Headers</h3>
        {headers.map((header, index) => (
          <div key={index} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <input
              type="text"
              placeholder="Header Name"
              value={header.key}
              onChange={(e) => updateHeader(index, "key", e.target.value)}
              style={{
                flex: 1,
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "14px"
              }}
            />
            <input
              type="text"
              placeholder="Header Value"
              value={header.value}
              onChange={(e) => updateHeader(index, "value", e.target.value)}
              style={{
                flex: 2,
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "14px"
              }}
            />
            {headers.length > 1 && (
              <button
                onClick={() => removeHeaderRow(index)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addHeaderRow}
          style={{
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            marginTop: "8px"
          }}
        >
          + Add Header
        </button>
      </div>

      {/* Cookies Section */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Custom Cookies</h3>
        {cookies.map((cookie, index) => (
          <div key={index} style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
            <input
              type="text"
              placeholder="Cookie Name"
              value={cookie.key}
              onChange={(e) => updateCookie(index, "key", e.target.value)}
              style={{
                flex: 1,
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "14px"
              }}
            />
            <input
              type="text"
              placeholder="Cookie Value"
              value={cookie.value}
              onChange={(e) => updateCookie(index, "value", e.target.value)}
              style={{
                flex: 2,
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "14px"
              }}
            />
            {cookies.length > 1 && (
              <button
                onClick={() => removeCookieRow(index)}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addCookieRow}
          style={{
            padding: "8px 16px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            marginTop: "8px"
          }}
        >
          + Add Cookie
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
        <button
          onClick={handleSave}
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          Save Configuration
        </button>
        <button
          onClick={handleSendRequest}
          disabled={!url.trim()}
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: !url.trim() ? "#6c757d" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: !url.trim() ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          Send Request
        </button>
      </div>

      {/* Usage Instructions */}
      <div style={{
        marginTop: "24px",
        padding: "12px",
        backgroundColor: "#f8f9fa",
        borderRadius: "4px",
        fontSize: "13px",
        color: "#666"
      }}>
        <p style={{ margin: "0 0 8px 0", fontWeight: "500" }}>📝 How to use:</p>
        <ol style={{ margin: 0, paddingLeft: "20px" }}>
          <li>Configure your headers and cookies</li>
          <li>Click "Save Configuration" to persist settings</li>
          <li>Enter a URL and optional request body</li>
          <li>Click "Send Request" to send with custom headers/cookies</li>
        </ol>
      </div>
    </div>
  );
};

export const init = (caido: Caido) => {
  // Create a container element for our React app
  const container = document.createElement("div");
  container.id = "headers-manager-root";
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.overflow = "auto";

  // Mount the React component
  const root = createRoot(container);
  root.render(<HeadersSidebar caido={caido} />);

  // Create a page using Caido SDK
  const page = caido.navigation.addPage("/headers-manager", {
    body: container
  });

  // Register sidebar item
  caido.sidebar.registerItem("Headers Manager", "/headers-manager", {
    icon: "fas fa-cookie"
  });

  console.log("Headers & Cookies Manager plugin initialized");
};
