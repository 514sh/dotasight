import { useState, useRef, useEffect } from "react";
import { HEROES, heroImgUrl } from "../data/heroes";

export default function HeroAutocomplete({
  onSelect,
  usedIds = [],
  placeholder = "Search hero...",
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);

  const results =
    query.length < 1
      ? []
      : HEROES.filter(
          (h) =>
            !usedIds.includes(h.id) &&
            h.name.toLowerCase().includes(query.toLowerCase()),
        ).slice(0, 7);

  const commit = (hero) => {
    onSelect(hero);
    setQuery("");
    setOpen(false);
    inputRef.current?.blur();
  };

  const handleKey = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((p) => Math.min(p + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((p) => Math.max(p - 1, 0));
    }
    if (e.key === "Enter" && results[highlighted]) commit(results[highlighted]);
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
  };

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 8,
          padding: "8px 12px",
          color: "#e8d5a3",
          fontSize: 13,
          fontFamily: "inherit",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      {open && results.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#1a1208",
            border: "1px solid rgba(255,180,0,0.3)",
            borderRadius: 8,
            zIndex: 9999,
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
          }}
        >
          {results.map((hero, i) => (
            <div
              key={hero.id}
              onMouseDown={() => commit(hero)}
              onMouseEnter={() => setHighlighted(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 10px",
                cursor: "pointer",
                background:
                  i === highlighted ? "rgba(255,180,0,0.15)" : "transparent",
                transition: "background 0.1s",
              }}
            >
              <img
                src={heroImgUrl(hero.slug)}
                alt={hero.name}
                style={{
                  width: 40,
                  height: 22,
                  objectFit: "cover",
                  borderRadius: 4,
                  flexShrink: 0,
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <span style={{ color: "#e8d5a3", fontSize: 13 }}>
                {hero.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
