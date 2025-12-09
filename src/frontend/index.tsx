import type { Caido } from "@caido/sdk-frontend";
import { useState, useEffect } from "react";

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
  const [selectedTabs, setSelectedTabs] = useState<string[]>([]);
  const [availableTabs, setAvailableTabs] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>("");

  // Load saved data on mount
  useEffect(() => {
    loadSavedData();
    loadAvailableTabs();
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

  const loadAvailableTabs = async () => {
    try {
      // Get list of available repeater tabs from backend
      const tabs = await caido.backend.getRepeaterTabs();
      setAvailableTabs(tabs || []);
    } catch (error) {
      console.error("Error loading tabs:", error);
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

  const handleRun = async () => {
    try {
      setStatusMessage("Running requests...");

      // Filter out empty entries
      const validHeaders = headers.filter(h => h.key.trim() !== "" && h.value.trim() !== "");
      const validCookies = cookies.filter(c => c.key.trim() !== "" && c.value.trim() !== "");

      const result = await caido.backend.modifyAndSendRequests({
        headers: validHeaders,
        cookies: validCookies,
        tabs: selectedTabs
      });

      setStatusMessage(`✓ Sent ${result.count} request(s)`);
      setTimeout(() => setStatusMessage(""), 5000);
    } catch (error) {
      console.error("Error running requests:", error);
      setStatusMessage("✗ Error sending requests");
      setTimeout(() => setStatusMessage(""), 3000);
    }
  };

  const addHeaderRow = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeaderRow = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
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
    setCookies(cookies.filter((_, i) => i !== index));
  };

  const updateCookie = (index: number, field: "key" | "value", value: string) => {
    const newCookies = [...cookies];
    newCookies[index][field] = value;
    setCookies(newCookies);
  };

  const toggleTab = (tabId: string) => {
    setSelectedTabs(prev =>
      prev.includes(tabId)
        ? prev.filter(id => id !== tabId)
        : [...prev, tabId]
    );
  };

  const selectAllTabs = () => {
    setSelectedTabs(availableTabs);
  };

  const deselectAllTabs = () => {
    setSelectedTabs([]);
  };

  return (
    <div style={{ padding: "16px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
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

      {/* Repeater Tabs Selection */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "16px", marginBottom: "12px" }}>Select Repeater Tabs</h3>
        <div style={{ marginBottom: "12px" }}>
          <button
            onClick={loadAvailableTabs}
            style={{
              padding: "6px 12px",
              backgroundColor: "#17a2b8",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
              marginRight: "8px"
            }}
          >
            Refresh Tabs
          </button>
          <button
            onClick={selectAllTabs}
            style={{
              padding: "6px 12px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px",
              marginRight: "8px"
            }}
          >
            Select All
          </button>
          <button
            onClick={deselectAllTabs}
            style={{
              padding: "6px 12px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            Deselect All
          </button>
        </div>
        {availableTabs.length === 0 ? (
          <p style={{ fontSize: "14px", color: "#666", fontStyle: "italic" }}>
            No repeater tabs available. Open some requests in Repeater first.
          </p>
        ) : (
          <div style={{
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "8px",
            maxHeight: "200px",
            overflowY: "auto"
          }}>
            {availableTabs.map((tab) => (
              <label
                key={tab}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedTabs.includes(tab)}
                  onChange={() => toggleTab(tab)}
                  style={{ marginRight: "8px" }}
                />
                {tab}
              </label>
            ))}
          </div>
        )}
        <p style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
          Selected: {selectedTabs.length} tab(s)
        </p>
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
          Save
        </button>
        <button
          onClick={handleRun}
          disabled={selectedTabs.length === 0}
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: selectedTabs.length === 0 ? "#6c757d" : "#28a745",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: selectedTabs.length === 0 ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "bold"
          }}
        >
          Run ({selectedTabs.length})
        </button>
      </div>
    </div>
  );
};

export const init = (caido: Caido) => {
  // Register the sidebar
  caido.sidebar.registerItem("Headers Manager", "/headers-manager", {
    component: () => <HeadersSidebar caido={caido} />
  });

  // Register backend commands
  caido.commands.register("headers-manager:refresh", {
    name: "Refresh Headers Manager",
    run: () => {
      caido.window.showToast("Headers Manager refreshed", { variant: "success" });
    }
  });
};
