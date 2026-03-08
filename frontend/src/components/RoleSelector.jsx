import { useState } from "react";
import { ROLES } from "../data/roles";

export default function RoleSelector({ selectedRole, onChange }) {
  const [open, setOpen] = useState(false);

  const current = ROLES.find((r) => r.value === selectedRole) ?? ROLES[0];

  const handleSelect = (role) => {
    onChange(role.value);
    setOpen(false);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 8,
        padding: "8px 14px",
        flexWrap: "wrap",
      }}
    >
      {/* Label */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div
          style={{
            width: 3,
            height: 16,
            background: current.color,
            borderRadius: 2,
            transition: "background 0.2s",
          }}
        />
        <span
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 10,
            fontFamily: "Rajdhani, sans-serif",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Preferred Role
        </span>
      </div>

      {/* Pill buttons — visible on wider screens */}
      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          flex: 1,
        }}
      >
        {ROLES.map((role) => {
          const isActive = selectedRole === role.value;
          return (
            <button
              key={role.value}
              onClick={() => onChange(role.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                borderRadius: 20,
                border: `1.5px solid ${isActive ? role.color : "rgba(255,255,255,0.1)"}`,
                background: isActive ? `${role.color}18` : "transparent",
                color: isActive ? role.color : "rgba(255,255,255,0.35)",
                fontSize: 11,
                fontFamily: "Rajdhani, sans-serif",
                fontWeight: 600,
                letterSpacing: "0.06em",
                cursor: "pointer",
                transition: "all 0.18s",
                whiteSpace: "nowrap",
                boxShadow: isActive ? `0 0 10px ${role.color}28` : "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = `${role.color}55`;
                  e.currentTarget.style.color = role.color;
                  e.currentTarget.style.background = `${role.color}0d`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: role.color,
                  flexShrink: 0,
                  opacity: isActive ? 1 : 0.45,
                  transition: "opacity 0.18s",
                }}
              />
              {role.label}
            </button>
          );
        })}
      </div>

      {/* Compact dropdown — visible on very small screens */}
      <div
        style={{
          position: "relative",
          display: "none", // toggled via inline media-query workaround below
        }}
        className="role-dropdown-compact"
      >
        <button
          onClick={() => setOpen((o) => !o)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.05)",
            border: `1px solid ${current.value === "any" ? "rgba(255,255,255,0.12)" : current.color + "55"}`,
            borderRadius: 8,
            padding: "7px 12px",
            color: current.color,
            fontSize: 12,
            fontFamily: "Rajdhani, sans-serif",
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.05em",
            transition: "all 0.2s",
            minWidth: 140,
            justifyContent: "space-between",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: current.color,
                flexShrink: 0,
              }}
            />
            {current.label}
          </span>
          <span
            style={{
              fontSize: 9,
              opacity: 0.6,
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
              display: "inline-block",
            }}
          >
            ▼
          </span>
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              background: "#1a1208",
              border: "1px solid rgba(255,180,0,0.25)",
              borderRadius: 8,
              zIndex: 999,
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
              minWidth: 160,
              animation: "fadeIn 0.15s ease-out",
            }}
          >
            {ROLES.map((role) => (
              <div
                key={role.value}
                onMouseDown={() => handleSelect(role)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "9px 14px",
                  cursor: "pointer",
                  background:
                    selectedRole === role.value
                      ? "rgba(255,180,0,0.1)"
                      : "transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  transition: "background 0.1s",
                  fontSize: 12,
                  color: role.color,
                  fontFamily: "Rajdhani, sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
                onMouseEnter={(e) => {
                  if (selectedRole !== role.value)
                    e.currentTarget.style.background =
                      "rgba(255,255,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  if (selectedRole !== role.value)
                    e.currentTarget.style.background = "transparent";
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: role.color,
                    flexShrink: 0,
                  }}
                />
                {role.label}
                {selectedRole === role.value && (
                  <span
                    style={{ marginLeft: "auto", color: "#ffb400", fontSize: 11 }}
                  >
                    ✓
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}