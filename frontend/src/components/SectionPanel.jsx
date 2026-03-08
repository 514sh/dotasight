import { HeroSlot, EmptySlot } from "./HeroSlot";
import HeroAutocomplete from "./HeroAutocomplete";

export default function SectionPanel({
  title,
  accent,
  heroes,
  maxSlots,
  onAdd,
  onRemove,
  variant,
  usedIds,
  inputPlaceholder,
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${accent}22`,
        borderRadius: 12,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{ width: 3, height: 18, background: accent, borderRadius: 2 }}
        />
        <span
          style={{
            color: accent,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </span>
        <span
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: 11,
            marginLeft: "auto",
          }}
        >
          {heroes.length}/{maxSlots}
        </span>
      </div>

      {/* Hero slots */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {heroes.map((h) => (
          <HeroSlot
            key={h.id}
            hero={h}
            onRemove={() => onRemove(h.id)}
            variant={variant}
          />
        ))}
        {Array.from({ length: Math.max(0, maxSlots - heroes.length) }).map(
          (_, i) => (
            <EmptySlot key={i} variant={variant} />
          ),
        )}
      </div>

      {/* Search input */}
      {heroes.length < maxSlots && (
        <HeroAutocomplete
          onSelect={onAdd}
          usedIds={usedIds}
          placeholder={inputPlaceholder}
        />
      )}
    </div>
  );
}
