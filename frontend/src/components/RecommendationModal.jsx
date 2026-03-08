import { useEffect } from "react";
import { resolveHero, roleStyle, heroImgUrl } from "../data/heroes";

const MEDALS = ["🥇", "🥈", "🥉"];

function RecommendationCard({ rec, index }) {
  const hero = resolveHero(rec);
  const rs = roleStyle(rec.role);

  return (
    <div
      style={{
        background:
          index === 0 ? "rgba(255,215,0,0.05)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${index === 0 ? "rgba(255,215,0,0.2)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 12,
        overflow: "hidden",
        animation: `fadeIn 0.3s ease-out ${index * 0.08}s both`,
      }}
    >
      {/* Portrait + Info row */}
      <div style={{ display: "flex" }}>
        {/* Portrait */}
        <div style={{ position: "relative", flexShrink: 0, width: 100 }}>
          {hero ? (
            <img
              src={heroImgUrl(hero.slug)}
              alt={hero.name}
              style={{
                width: "100%",
                height: "100%",
                minHeight: 80,
                objectFit: "cover",
                display: "block",
              }}
              onError={(e) => {
                e.target.style.background = "#1a1208";
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                minHeight: 80,
                background: "#1a1208",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 26 }}>
                ?
              </span>
            </div>
          )}
          <div
            style={{
              position: "absolute",
              top: 6,
              left: 6,
              background: "rgba(0,0,0,0.8)",
              borderRadius: 6,
              padding: "2px 6px",
              fontSize: 15,
              lineHeight: 1.3,
            }}
          >
            {MEDALS[index] ?? `#${index + 1}`}
          </div>
        </div>

        {/* Info */}
        <div
          style={{
            flex: 1,
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                color: "#e8d5a3",
                fontWeight: 700,
                fontSize: 15,
                fontFamily: "Cinzel, serif",
              }}
            >
              {rec.hero_name ?? hero?.name ?? "Unknown"}
            </span>
            {rec.role && (
              <span
                style={{
                  background: rs.bg,
                  color: rs.text,
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 20,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  fontFamily: "Rajdhani, sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                {rec.role}
              </span>
            )}
          </div>
          {rec.reason && (
            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.5)",
                fontSize: 12,
                lineHeight: 1.5,
                fontFamily: "Rajdhani, sans-serif",
              }}
            >
              {rec.reason}
            </p>
          )}
        </div>
      </div>

      {/* Items row */}
      {rec.items && rec.items.length > 0 && (
        <div
          style={{
            padding: "10px 14px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 10,
              marginBottom: 6,
              fontFamily: "Rajdhani, sans-serif",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Core Items
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {rec.items.map((item, j) => (
              <span
                key={j}
                style={{
                  background: "rgba(255,180,0,0.08)",
                  border: "1px solid rgba(255,180,0,0.2)",
                  color: "#c8a050",
                  fontSize: 11,
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontFamily: "Rajdhani, sans-serif",
                  fontWeight: 500,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecommendationModal({
  recommendations,
  onClose,
  error,
}) {
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
        zIndex: 1000,
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
          maxWidth: 560,
          maxHeight: "85vh",
          background: "linear-gradient(160deg, #140f04 0%, #0d0a04 100%)",
          border: "1px solid rgba(255,180,0,0.25)",
          borderRadius: 16,
          boxShadow:
            "0 0 60px rgba(255,140,0,0.15), 0 24px 80px rgba(0,0,0,0.8)",
          display: "flex",
          flexDirection: "column",
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
            flexShrink: 0,
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
                }}
              >
                ⚡ Draft Recommendations
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 10,
                  fontFamily: "Rajdhani, sans-serif",
                  marginTop: 2,
                }}
              >
                {recommendations.length} heroes suggested
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

        {/* API error notice */}
        {error && (
          <div
            style={{
              padding: "8px 20px",
              background: "rgba(255,100,0,0.08)",
              borderBottom: "1px solid rgba(255,100,0,0.15)",
            }}
          >
            <span
              style={{
                color: "rgba(255,160,0,0.8)",
                fontSize: 11,
                fontFamily: "Rajdhani, sans-serif",
              }}
            >
              ⚠ Could not reach API — showing demo data
            </span>
          </div>
        )}

        {/* Cards */}
        <div
          style={{
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {recommendations.map((rec, i) => (
            <RecommendationCard key={i} rec={rec} index={i} />
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "10px 20px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
            textAlign: "center",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: 10,
              fontFamily: "Rajdhani, sans-serif",
              letterSpacing: "0.08em",
            }}
          >
            Press ESC or click outside to close
          </span>
        </div>
      </div>
    </div>
  );
}
