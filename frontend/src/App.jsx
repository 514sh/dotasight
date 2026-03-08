import SectionPanel from "./components/SectionPanel";
import RecommendationModal from "./components/RecommendationModal";
import { useDraft } from "./hooks/useDraft";
import AccountIdModal from "./components/AccountIdModal";
import ErrorModal from "./components/ErrorModal";
import { useAccountId } from "./hooks/useAccountId";
import RoleSelector from "./components/RoleSelector";

export default function DraftAdvisor() {
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log("the api",apiUrl)

  const {
    accountId,
    ignored,
    activeAccountId,
    showModal: showAccountModal,
    setShowModal: setShowAccountModal,
    save: saveAccountId,
    clear: clearAccountId,
  } = useAccountId();

  const {
    selectedRole,
    setSelectedRole,
    bans,
    radiantPicks,
    direPicks,
    recommendations,
    loading,
    error,
    showModal,
    setShowModal,
    apiError,
    setApiError,
    canQuery,
    allUsed,
    addTo,
    removeFrom,
    fetchRecommendations,
    clearAll,
    setBans,
    setRadiantPicks,
    setDirePicks,
    myTeam,
    setMyTeam,
  } = useDraft(apiUrl, activeAccountId);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0a04",
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,140,0,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 40% 40% at 80% 80%, rgba(100,60,0,0.12) 0%, transparent 50%)
        `,
        fontFamily: "'Cinzel', 'Georgia', serif",
        padding: "20px 16px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Rajdhani:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(232,213,163,0.3); }
        input:focus { border-color: rgba(255,180,0,0.5) !important; outline: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,180,0,0.3); border-radius: 4px; }
        @keyframes spin    { to { transform: rotate(360deg) } }
        @keyframes fadeIn  { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) scale(0.97) } to { opacity:1; transform:translateY(0) scale(1) } }

        /* Hide pill buttons, show compact dropdown on very small screens */
        @media (max-width: 480px) {
          .role-pills { display: none !important; }
          .role-dropdown-compact { display: block !important; }
        }
        /* Show pill buttons, hide compact dropdown on larger screens */
        @media (min-width: 481px) {
          .role-pills { display: flex !important; }
          .role-dropdown-compact { display: none !important; }
        }
      `}</style>

      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(20px, 4vw, 32px)",
              fontWeight: 700,
              background:
                "linear-gradient(135deg, #ffb400 0%, #ff6b35 50%, #ffb400 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            ⚔ Dotasight
          </h1>
          <p
            style={{
              margin: "4px 0 0",
              color: "rgba(255,255,255,0.35)",
              fontSize: 12,
              fontFamily: "Rajdhani, sans-serif",
              letterSpacing: "0.1em",
            }}
          >
            INTELLIGENT DRAFT RECOMMENDATIONS
          </p>
        </div>

        {/* Team selector */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 11,
              fontFamily: "Rajdhani, sans-serif",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            My Team
          </span>
          {["radiant", "dire"].map((team) => {
            const isActive = myTeam === team;
            const color = team === "radiant" ? "#64c8ff" : "#ff5050";
            const label = team === "radiant" ? "⚔ Radiant" : "☠ Dire";
            return (
              <button
                key={team}
                onClick={() => setMyTeam(team)}
                style={{
                  flex: 1,
                  maxWidth: 160,
                  padding: "10px 0",
                  borderRadius: 8,
                  border: `1.5px solid ${isActive ? color : "rgba(255,255,255,0.1)"}`,
                  background: isActive
                    ? `${color}18`
                    : "rgba(255,255,255,0.03)",
                  color: isActive ? color : "rgba(255,255,255,0.35)",
                  fontSize: 13,
                  fontFamily: "Cinzel, serif",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: isActive ? `0 0 16px ${color}30` : "none",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Steam Account ID row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 8,
            padding: "8px 14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 10,
                fontFamily: "Rajdhani, sans-serif",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Steam Account
            </span>
            {ignored ? (
              <span
                style={{
                  color: "rgba(255,255,255,0.25)",
                  fontSize: 11,
                  fontFamily: "Rajdhani, sans-serif",
                }}
              >
                Skipped — generic recommendations
              </span>
            ) : accountId ? (
              <span
                style={{
                  color: "#ffb400",
                  fontSize: 11,
                  fontFamily: "Rajdhani, monospace",
                }}
              >
                {accountId}
              </span>
            ) : (
              <span
                style={{
                  color: "rgba(255,255,255,0.25)",
                  fontSize: 11,
                  fontFamily: "Rajdhani, sans-serif",
                }}
              >
                Not set — generic recommendations
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setShowAccountModal(true)}
              style={{
                background: "rgba(255,180,0,0.08)",
                border: "1px solid rgba(255,180,0,0.2)",
                borderRadius: 6,
                color: "#ffb400",
                fontSize: 10,
                fontFamily: "Rajdhani, sans-serif",
                fontWeight: 600,
                letterSpacing: "0.06em",
                padding: "4px 10px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,180,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,180,0,0.08)";
              }}
            >
              {accountId || ignored ? "EDIT" : "SET ID"}
            </button>
            {(accountId || ignored) && (
              <button
                onClick={clearAccountId}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 10,
                  fontFamily: "Rajdhani, sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  padding: "4px 10px",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#ff6060";
                  e.currentTarget.style.borderColor = "rgba(255,80,80,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.3)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                }}
              >
                CLEAR
              </button>
            )}
          </div>
        </div>

        {/* Draft sections */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          <SectionPanel
            title="Bans"
            accent="#ff6b35"
            heroes={bans}
            maxSlots={12}
            onAdd={addTo(setBans, 12)}
            onRemove={removeFrom(setBans)}
            variant="ban"
            usedIds={allUsed}
            inputPlaceholder="Ban a hero..."
          />
          <SectionPanel
            title="Radiant Picks"
            accent="#64c8ff"
            heroes={radiantPicks}
            maxSlots={5}
            onAdd={addTo(setRadiantPicks, 5)}
            onRemove={removeFrom(setRadiantPicks)}
            variant="pick"
            usedIds={allUsed}
            inputPlaceholder="Pick allied hero..."
          />
          <SectionPanel
            title="Dire Picks"
            accent="#ff5050"
            heroes={direPicks}
            maxSlots={5}
            onAdd={addTo(setDirePicks, 5)}
            onRemove={removeFrom(setDirePicks)}
            variant="enemy"
            usedIds={allUsed}
            inputPlaceholder="Pick enemy hero..."
          />
        </div>

        {/* Role Selector */}
        <RoleSelector selectedRole={selectedRole} onChange={setSelectedRole} />

        {/* Actions */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={fetchRecommendations}
            disabled={!canQuery || loading}
            style={{
              background:
                canQuery && !loading
                  ? "linear-gradient(135deg, #c8860a 0%, #ff6b35 100%)"
                  : "rgba(255,255,255,0.08)",
              color: canQuery && !loading ? "#fff" : "rgba(255,255,255,0.3)",
              border: "none",
              borderRadius: 8,
              padding: "12px 32px",
              fontSize: 13,
              fontFamily: "Cinzel, serif",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: canQuery && !loading ? "pointer" : "not-allowed",
              boxShadow:
                canQuery && !loading ? "0 0 20px rgba(255,140,0,0.3)" : "none",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid #fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    display: "inline-block",
                  }}
                />
                Analyzing...
              </>
            ) : (
              "⚡ Get Recommendations"
            )}
          </button>

          {recommendations && !loading && (
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: "rgba(255,180,0,0.1)",
                color: "#ffb400",
                border: "1px solid rgba(255,180,0,0.3)",
                borderRadius: 8,
                padding: "12px 20px",
                fontSize: 12,
                fontFamily: "Cinzel, serif",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              View Results
            </button>
          )}

          <button
            onClick={clearAll}
            style={{
              background: "transparent",
              color: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              padding: "12px 20px",
              fontSize: 12,
              fontFamily: "Cinzel, serif",
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}
          >
            Clear
          </button>
        </div>

        <p
          style={{
            textAlign: "center",
            color: "rgba(255,255,255,0.2)",
            fontSize: 10,
            fontFamily: "Rajdhani, sans-serif",
            letterSpacing: "0.08em",
            margin: 0,
          }}
        >
          Click any hero portrait to remove • Overlay activates automatically
          during draft phase via GSI
        </p>
      </div>

      {showModal && recommendations && (
        <RecommendationModal
          recommendations={recommendations}
          onClose={() => setShowModal(false)}
          error={error}
        />
      )}

      {apiError && (
        <ErrorModal
          errorType={apiError.type}
          message={apiError.message}
          onClose={() => setApiError(null)}
        />
      )}

      {showAccountModal && (
        <AccountIdModal
          initialId={accountId}
          initialIgnored={ignored}
          hasDecided={!!(accountId || ignored)}
          onSave={saveAccountId}
          onClose={() => setShowAccountModal(false)}
        />
      )}
    </div>
  );
}
