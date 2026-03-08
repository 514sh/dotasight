import { heroImgUrl } from "../data/heroes";

const VARIANT_STYLES = {
  pick: { border: "rgba(100,200,255,0.4)", glow: "rgba(100,200,255,0.15)" },
  enemy: { border: "rgba(255,80,80,0.4)", glow: "rgba(255,80,80,0.15)" },
  ban: { border: "rgba(255,140,0,0.4)", glow: "rgba(255,140,0,0.15)" },
};

const EMPTY_STYLES = {
  pick: { border: "rgba(100,200,255,0.2)", bg: "rgba(100,200,255,0.04)" },
  enemy: { border: "rgba(255,80,80,0.2)", bg: "rgba(255,80,80,0.04)" },
  ban: { border: "rgba(255,140,0,0.2)", bg: "rgba(255,140,0,0.04)" },
};

export function HeroSlot({ hero, onRemove, variant = "pick" }) {
  const c = VARIANT_STYLES[variant];
  return (
    <div
      onClick={onRemove}
      title="Click to remove"
      style={{
        position: "relative",
        width: 72,
        height: 48,
        borderRadius: 8,
        border: `1.5px solid ${c.border}`,
        boxShadow: `0 0 12px ${c.glow}`,
        overflow: "hidden",
        cursor: "pointer",
        flexShrink: 0,
        transition: "transform 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <img
        src={heroImgUrl(hero.slug)}
        alt={hero.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
        onError={(e) => {
          e.target.style.background = "#333";
        }}
      />
      {variant === "ban" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#ff6b35", fontSize: 20, fontWeight: 900 }}>
            ✕
          </span>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(0,0,0,0.7)",
          padding: "2px 4px",
          fontSize: 9,
          color: "#e8d5a3",
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {hero.name}
      </div>
    </div>
  );
}

export function EmptySlot({ variant = "pick" }) {
  const s = EMPTY_STYLES[variant];
  return (
    <div
      style={{
        width: 72,
        height: 48,
        borderRadius: 8,
        border: `1.5px dashed ${s.border}`,
        background: s.bg,
        flexShrink: 0,
      }}
    />
  );
}
