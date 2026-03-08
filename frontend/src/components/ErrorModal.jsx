import { useEffect } from "react";

const ERROR_CONFIGS = {
  rate_limit: {
    icon: "⏱",
    title: "Slow Down",
    color: "#ff9040",
    borderColor: "rgba(255,144,64,0.25)",
    bgColor: "rgba(255,144,64,0.04)",
    accentColor: "linear-gradient(180deg, #ff9040, #ff6b35)",
  },
  network: {
    icon: "📡",
    title: "Connection Error",
    color: "#ff5050",
    borderColor: "rgba(255,80,80,0.25)",
    bgColor: "rgba(255,80,80,0.04)",
    accentColor: "linear-gradient(180deg, #ff5050, #c0392b)",
  },
  server: {
    icon: "⚠",
    title: "Server Error",
    color: "#ffb400",
    borderColor: "rgba(255,180,0,0.25)",
    bgColor: "rgba(255,180,0,0.04)",
    accentColor: "linear-gradient(180deg, #ffb400, #ff6b35)",
  },
  default: {
    icon: "✕",
    title: "Something Went Wrong",
    color: "#ff5050",
    borderColor: "rgba(255,80,80,0.25)",
    bgColor: "rgba(255,80,80,0.04)",
    accentColor: "linear-gradient(180deg, #ff5050, #c0392b)",
  },
};

export default function ErrorModal({
  errorType = "default",
  message,
  onClose,
}) {
  const cfg = ERROR_CONFIGS[errorType] ?? ERROR_CONFIGS.default;

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
        zIndex: 3000,
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
          maxWidth: 400,
          background: "linear-gradient(160deg, #140f04 0%, #0d0a04 100%)",
          border: `1px solid ${cfg.borderColor}`,
          borderRadius: 16,
          boxShadow: `0 0 60px ${cfg.borderColor}, 0 24px 80px rgba(0,0,0,0.8)`,
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
            borderBottom: `1px solid ${cfg.borderColor}`,
            background: cfg.bgColor,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 3,
                height: 20,
                background: cfg.accentColor,
                borderRadius: 2,
              }}
            />
            <div>
              <div
                style={{
                  color: cfg.color,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "Cinzel, serif",
                }}
              >
                {cfg.icon} {cfg.title}
              </div>
            </div>
          </div>
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
        </div>

        {/* Body */}
        <div style={{ padding: "20px 20px 24px" }}>
          <p
            style={{
              margin: "0 0 20px",
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
              fontFamily: "Rajdhani, sans-serif",
              lineHeight: 1.6,
            }}
          >
            {message}
          </p>

          <button
            onClick={onClose}
            style={{
              width: "100%",
              background: `linear-gradient(135deg, ${cfg.color}cc 0%, ${cfg.color}88 100%)`,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "11px 0",
              fontSize: 12,
              fontFamily: "Cinzel, serif",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "brightness(1.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "none";
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
