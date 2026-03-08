import { useState, useEffect } from "react";

// hasDecided = user has previously set an ID or chosen to skip
export default function AccountIdModal({
  initialId,
  initialIgnored,
  onSave,
  onClose,
  hasDecided,
}) {
  const [inputValue, setInputValue] = useState(initialId ?? "");
  const [ignore, setIgnore] = useState(initialIgnored ?? false);
  const [error, setError] = useState("");

  // Sync if parent re-opens with new values
  useEffect(() => {
    setInputValue(initialId ?? "");
    setIgnore(initialIgnored ?? false);
    setError("");
  }, [initialId, initialIgnored]);

  const handleSave = () => {
    if (!ignore && inputValue.trim() === "") {
      setError("Enter your Steam Account ID or check the box to skip.");
      return;
    }
    // Steam Account ID is a 32-bit number (friend ID), validate loosely
    if (!ignore && !/^\d+$/.test(inputValue.trim())) {
      setError("Account ID should be a number. Find it at steamid.io");
      return;
    }
    onSave(inputValue.trim(), ignore);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onClose();
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "fadeIn 0.2s ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 420,
          background: "linear-gradient(160deg, #140f04 0%, #0d0a04 100%)",
          border: "1px solid rgba(255,180,0,0.25)",
          borderRadius: 16,
          boxShadow:
            "0 0 60px rgba(255,140,0,0.12), 0 24px 80px rgba(0,0,0,0.8)",
          overflow: "hidden",
          animation: "slideUp 0.25s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,180,0,0.12)",
            background: "rgba(255,140,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 3,
                height: 20,
                background: "linear-gradient(180deg, #ffb400, #ff6b35)",
                borderRadius: 2,
              }}
            />
            <div>
              <div
                style={{
                  color: "#ffb400",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "Cinzel, serif",
                }}
              >
                Steam Account ID
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 10,
                  fontFamily: "Rajdhani, sans-serif",
                  marginTop: 2,
                }}
              >
                For personalized hero recommendations
              </div>
            </div>
          </div>
          {/* Only show ✕ if user has already made a decision before */}
          {hasDecided && (
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "rgba(255,255,255,0.5)",
                width: 32,
                height: 32,
                cursor: "pointer",
                fontSize: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,80,80,0.2)";
                e.currentTarget.style.color = "#ff5050";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "20px 20px 24px" }}>
          {/* Description */}
          <p
            style={{
              margin: "0 0 16px",
              color: "rgba(255,255,255,0.45)",
              fontSize: 12,
              fontFamily: "Rajdhani, sans-serif",
              lineHeight: 1.6,
            }}
          >
            Your Steam Account ID lets us tailor recommendations based on your
            hero pool and recent matches. You can find your Account ID at{" "}
            <span style={{ color: "#ffb400" }}>steamid.io</span>. It's a number
            like{" "}
            <span style={{ color: "rgba(255,255,255,0.6)" }}>123456789</span>.
          </p>

          {/* Input */}
          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                display: "block",
                color: "rgba(255,255,255,0.4)",
                fontSize: 10,
                fontFamily: "Rajdhani, sans-serif",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Account ID
            </label>
            <input
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. 123456789"
              disabled={ignore}
              style={{
                width: "100%",
                background: ignore
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(255,255,255,0.06)",
                border: `1px solid ${error ? "rgba(255,80,80,0.5)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 8,
                padding: "10px 12px",
                color: ignore ? "rgba(255,255,255,0.2)" : "#e8d5a3",
                fontSize: 13,
                fontFamily: "Rajdhani, monospace",
                outline: "none",
                boxSizing: "border-box",
                transition: "all 0.2s",
                cursor: ignore ? "not-allowed" : "text",
              }}
            />
            {error && (
              <p
                style={{
                  margin: "6px 0 0",
                  color: "#ff6060",
                  fontSize: 11,
                  fontFamily: "Rajdhani, sans-serif",
                }}
              >
                {error}
              </p>
            )}
          </div>

          {/* Ignore checkbox */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              marginBottom: 20,
              userSelect: "none",
            }}
          >
            <div
              onClick={() => {
                setIgnore((p) => !p);
                setError("");
              }}
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                border: `1.5px solid ${ignore ? "#ffb400" : "rgba(255,255,255,0.2)"}`,
                background: ignore ? "rgba(255,180,0,0.2)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.15s",
              }}
            >
              {ignore && (
                <span style={{ color: "#ffb400", fontSize: 11, lineHeight: 1 }}>
                  ✓
                </span>
              )}
            </div>
            <span
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 12,
                fontFamily: "Rajdhani, sans-serif",
              }}
            >
              Skip — recommend without my account data
            </span>
          </label>

          {/* Save button */}
          <button
            onClick={handleSave}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #c8860a 0%, #ff6b35 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 0",
              fontSize: 13,
              fontFamily: "Cinzel, serif",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 0 20px rgba(255,140,0,0.25)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "brightness(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "none";
            }}
          >
            Save & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
