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

interface RequestInfo {
  id: string;
  method: string;
  url: string;
  host: string;
  path: string;
  statusCode: number;
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

const HeadersSidebar = ({ caido }: { caido: Caido }) => {
  const [headers, setHeaders] = useState<HeaderEntry[]>([{ key: "", value: "" }]);
  const [cookies, setCookies] = useState<CookieEntry[]>([{ key: "", value: "" }]);
  const [requests, setRequests] = useState<RequestInfo[]>([]);
  const [selectedRequestIds, setSelectedRequestIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [results, setResults] = useState<RequestResult[]>([]);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSavedData();
    loadRequests();
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

  const loadRequests = async (query?: string) => {
    setIsLoading(true);
    try {
      const httpHistory = await caido.backend.getHttpHistory(query);
      setRequests(httpHistory || []);
      setStatusMessage(`Loaded ${httpHistory?.length || 0} requests`);
      setTimeout(() => setStatusMessage(""), 2000);
    } catch (error) {
      console.error("Error loading requests:", error);
      setStatusMessage("✗ Error loading requests");
      setTimeout(() => setStatusMessage(""), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    loadRequests(searchQuery);
  };

  const handleSave = async () => {
    try {
      const validHeaders = headers.filter(h => h.key.trim() !== "" || h.value.trim() !== "");
      const validCookies = cookies.filter(c => c.key.trim() !== "" || c.value.trim() !== "");

      const dataToSave: StoredData = {
        headers: validHeaders.length > 0 ? validHeaders : [{ key: "", value: "" }],
        cookies: validCookies.length > 0 ? validCookies : [{ key: "", value: "" }]
      };

      await caido.storage.set("headers-cookies-data", JSON.stringify(dataToSave));
      setStatusMessage("✓ Configuration saved!");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      console.error("Error saving data:", error);
      setStatusMessage("✗ Error saving configuration");
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  const handleRunSelected = async () => {
    if (selectedRequestIds.size === 0) {
      setStatusMessage("✗ Please select at least one request");
      setTimeout(() => setStatusMessage(""), 3000);
      return;
    }

    setIsSending(true);
    setStatusMessage(`Sending ${selectedRequestIds.size} request(s)...`);
    setResults([]);

    try {
      const validHeaders = headers.filter(h => h.key.trim() !== "" && h.value.trim() !== "");
      const validCookies = cookies.filter(c => c.key.trim() !== "" && c.value.trim() !== "");

      const result = await caido.backend.sendSelectedRequests({
        headers: validHeaders,
        cookies: validCookies,
        requestIds: Array.from(selectedRequestIds)
      });

      setResults(result.results || []);
      setStatusMessage(`✓ Completed: ${result.successCount} succeeded, ${result.failCount} failed`);
    } catch (error) {
      console.error("Error sending requests:", error);
      setStatusMessage(`✗ Error: ${error}`);
    } finally {
      setIsSending(false);
    }
  };

  const toggleRequest = (id: string) => {
    const newSelected = new Set(selectedRequestIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRequestIds(newSelected);
  };

  const selectAll = () => {
    setSelectedRequestIds(new Set(requests.map(r => r.id)));
  };

  const deselectAll = () => {
    setSelectedRequestIds(new Set());
  };

  const toggleResultExpand = (requestId: string) => {
    const newExpanded = new Set(expandedResults);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedResults(newExpanded);
  };

  const addHeaderRow = () => setHeaders([...headers, { key: "", value: "" }]);
  const removeHeaderRow = (index: number) => {
    if (headers.length > 1) setHeaders(headers.filter((_, i) => i !== index));
  };
  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const addCookieRow = () => setCookies([...cookies, { key: "", value: "" }]);
  const removeCookieRow = (index: number) => {
    if (cookies.length > 1) setCookies(cookies.filter((_, i) => i !== index));
  };
  const updateCookie = (index: number, field: "key" | "value", value: string) => {
    const newCookies = [...cookies];
    newCookies[index][field] = value;
    setCookies(newCookies);
  };

  return (
    <div style={{ padding: "16px", fontFamily: "system-ui, -apple-system, sans-serif", height: "100%", overflow: "auto" }}>
      <h2 style={{ marginTop: 0, marginBottom: "16px", fontSize: "20px", fontWeight: "bold" }}>
        🍪 Headers & Cookies Manager
      </h2>

      {statusMessage && (
        <div style={{
          padding: "10px 12px",
          marginBottom: "16px",
          backgroundColor: statusMessage.startsWith("✓") ? "#d4edda" : "#f8d7da",
          color: statusMessage.startsWith("✓") ? "#155724" : "#721c24",
          borderRadius: "4px",
          fontSize: "14px",
          border: `1px solid ${statusMessage.startsWith("✓") ? "#c3e6cb" : "#f5c6cb"}`
        }}>
          {statusMessage}
        </div>
      )}

      {/* Headers Configuration */}
      <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: "#f8f9fa", borderRadius: "6px" }}>
        <h3 style={{ fontSize: "16px", marginBottom: "12px", marginTop: 0 }}>📝 Custom Headers</h3>
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
                fontSize: "13px"
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
                fontSize: "13px"
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
                  fontSize: "13px"
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button onClick={addHeaderRow} style={{
          padding: "6px 12px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "13px",
          marginTop: "4px"
        }}>
          + Add Header
        </button>
      </div>

      {/* Cookies Configuration */}
      <div style={{ marginBottom: "24px", padding: "16px", backgroundColor: "#f8f9fa", borderRadius: "6px" }}>
        <h3 style={{ fontSize: "16px", marginBottom: "12px", marginTop: 0 }}>🍪 Custom Cookies</h3>
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
                fontSize: "13px"
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
                fontSize: "13px"
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
                  fontSize: "13px"
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button onClick={addCookieRow} style={{
          padding: "6px 12px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "13px",
          marginTop: "4px"
        }}>
          + Add Cookie
        </button>
      </div>

      <button onClick={handleSave} style={{
        width: "100%",
        padding: "12px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "15px",
        fontWeight: "bold",
        marginBottom: "24px"
      }}>
        💾 Save Configuration
      </button>

      <hr style={{ border: "none", borderTop: "2px solid #dee2e6", margin: "24px 0" }} />

      {/* HTTP History Requests */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "18px", marginBottom: "12px", fontWeight: "bold" }}>📋 Select Requests from HTTP History</h3>

        {/* Search Bar */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input
            type="text"
            placeholder="Search (e.g., host:example.com, path:/api, method:POST)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            style={{
              flex: 1,
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px"
            }}
          />
          <button onClick={handleSearch} style={{
            padding: "10px 20px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px"
          }}>
            🔍 Search
          </button>
          <button onClick={() => { setSearchQuery(""); loadRequests(); }} style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px"
          }}>
            Clear
          </button>
        </div>

        {/* Selection Controls */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <button onClick={selectAll} style={{
            padding: "6px 12px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px"
          }}>
            Select All
          </button>
          <button onClick={deselectAll} style={{
            padding: "6px 12px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px"
          }}>
            Deselect All
          </button>
          <span style={{ marginLeft: "auto", alignSelf: "center", fontSize: "14px", color: "#666" }}>
            Selected: <strong>{selectedRequestIds.size}</strong> / {requests.length}
          </span>
        </div>

        {/* Request List */}
        <div style={{
          border: "1px solid #dee2e6",
          borderRadius: "6px",
          maxHeight: "400px",
          overflow: "auto",
          backgroundColor: "white"
        }}>
          {isLoading ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              No requests found. Try adjusting your search or capture some requests first.
            </div>
          ) : (
            requests.map((req) => (
              <label
                key={req.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f0f0f0",
                  backgroundColor: selectedRequestIds.has(req.id) ? "#e7f3ff" : "transparent",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (!selectedRequestIds.has(req.id)) {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedRequestIds.has(req.id)) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedRequestIds.has(req.id)}
                  onChange={() => toggleRequest(req.id)}
                  style={{ marginRight: "12px", width: "16px", height: "16px" }}
                />
                <span style={{
                  fontWeight: "bold",
                  color: "#007bff",
                  minWidth: "60px",
                  fontSize: "13px"
                }}>
                  {req.method}
                </span>
                <span style={{
                  flex: 1,
                  fontSize: "13px",
                  marginLeft: "8px",
                  wordBreak: "break-all"
                }}>
                  {req.url}
                </span>
                <span style={{
                  fontSize: "13px",
                  color: req.statusCode >= 200 && req.statusCode < 300 ? "#28a745" :
                        req.statusCode >= 300 && req.statusCode < 400 ? "#ffc107" :
                        req.statusCode >= 400 ? "#dc3545" : "#6c757d",
                  fontWeight: "bold",
                  marginLeft: "12px",
                  minWidth: "50px",
                  textAlign: "right"
                }}>
                  {req.statusCode || "---"}
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Run Button */}
      <button
        onClick={handleRunSelected}
        disabled={selectedRequestIds.size === 0 || isSending}
        style={{
          width: "100%",
          padding: "14px",
          backgroundColor: selectedRequestIds.size === 0 || isSending ? "#6c757d" : "#28a745",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: selectedRequestIds.size === 0 || isSending ? "not-allowed" : "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          marginBottom: "24px"
        }}
      >
        {isSending ? "⏳ Sending..." : `🚀 Run Selected Requests (${selectedRequestIds.size})`}
      </button>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h3 style={{ fontSize: "18px", marginBottom: "12px", fontWeight: "bold" }}>📊 Results</h3>
          <div style={{ border: "1px solid #dee2e6", borderRadius: "6px", backgroundColor: "white" }}>
            {results.map((result, index) => (
              <div
                key={result.requestId}
                style={{
                  borderBottom: index < results.length - 1 ? "1px solid #f0f0f0" : "none",
                  padding: "12px"
                }}
              >
                <div
                  onClick={() => toggleResultExpand(result.requestId)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "4px",
                    backgroundColor: "#f8f9fa"
                  }}
                >
                  <span style={{ fontSize: "18px", marginRight: "8px" }}>
                    {expandedResults.has(result.requestId) ? "▼" : "▶"}
                  </span>
                  <span style={{ fontSize: "16px", marginRight: "12px" }}>
                    {result.success ? "✅" : "❌"}
                  </span>
                  <span style={{
                    flex: 1,
                    fontSize: "14px",
                    wordBreak: "break-all"
                  }}>
                    {result.originalUrl}
                  </span>
                  <span style={{
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: result.success ? "#28a745" : "#dc3545",
                    marginLeft: "12px"
                  }}>
                    {result.statusCode || result.error}
                  </span>
                </div>

                {expandedResults.has(result.requestId) && (
                  <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                    {result.success && result.response ? (
                      <>
                        <div style={{ marginBottom: "12px" }}>
                          <strong style={{ fontSize: "13px" }}>Status Code:</strong>
                          <span style={{ marginLeft: "8px", fontSize: "13px" }}>{result.response.statusCode}</span>
                        </div>

                        <div style={{ marginBottom: "12px" }}>
                          <strong style={{ fontSize: "13px" }}>Response Headers:</strong>
                          <pre style={{
                            fontSize: "12px",
                            backgroundColor: "#fff",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #dee2e6",
                            overflow: "auto",
                            marginTop: "4px",
                            maxHeight: "150px"
                          }}>
                            {JSON.stringify(result.response.headers, null, 2)}
                          </pre>
                        </div>

                        <div>
                          <strong style={{ fontSize: "13px" }}>Response Body:</strong>
                          <pre style={{
                            fontSize: "12px",
                            backgroundColor: "#fff",
                            padding: "8px",
                            borderRadius: "4px",
                            border: "1px solid #dee2e6",
                            overflow: "auto",
                            marginTop: "4px",
                            maxHeight: "300px",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word"
                          }}>
                            {result.response.body || "(empty)"}
                          </pre>
                        </div>
                      </>
                    ) : (
                      <div style={{ color: "#dc3545", fontSize: "13px" }}>
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const init = (caido: Caido) => {
  const container = document.createElement("div");
  container.id = "headers-manager-root";
  container.style.width = "100%";
  container.style.height = "100%";
  container.style.overflow = "auto";

  const root = createRoot(container);
  root.render(<HeadersSidebar caido={caido} />);

  caido.navigation.addPage("/headers-manager", {
    body: container
  });

  caido.sidebar.registerItem("Headers Manager", "/headers-manager", {
    icon: "fas fa-cookie"
  });

  console.log("Headers & Cookies Manager plugin initialized");
};
