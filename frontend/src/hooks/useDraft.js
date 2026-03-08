import { useState, useCallback } from "react";
import { DEMO_RECOMMENDATIONS } from "../data/heroes";
import { ROLES } from "../data/roles";

export function useDraft(apiUrl, accountId = null) {
  const [bans, setBans] = useState([]);
  const [radiantPicks, setRadiantPicks] = useState([]);
  const [direPicks, setDirePicks] = useState([]);
  const [myTeam, setMyTeam] = useState("radiant");
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [selectedRole, setSelectedRole] = useState("any");

  const canQuery = radiantPicks.length >= 1 || direPicks.length >= 1;
  const allUsed = [...bans, ...radiantPicks, ...direPicks].map((h) => h.id);

  const addTo = (setter, max) => (hero) =>
    setter((prev) => (prev.length < max ? [...prev, hero] : prev));

  const removeFrom = (setter) => (id) =>
    setter((prev) => prev.filter((h) => h.id !== id));

  const fetchRecommendations = useCallback(async () => {
    if (!canQuery) return;
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`${apiUrl}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bans: bans.map((h) => h.id),
          radiant_picks: radiantPicks.map((h) => h.id),
          dire_picks: direPicks.map((h) => h.id),
          my_team: myTeam,
          role: selectedRole,
          ...(accountId ? { account_id: accountId } : {}),
        }),
      });

      if (!res.ok) {
        let errorType = "server";
        let errorMessage =
          "The server encountered an error. Please try again in a moment.";
        try {
          const errData = await res.json();
          if (res.status === 429) {
            errorType = "rate_limit";
            errorMessage =
              errData.message ??
              "Too many requests. Please wait a moment before trying again.";
          } else {
            errorMessage = errData.message ?? errorMessage;
          }
        } catch (_) {}
        setApiError({ type: errorType, message: errorMessage });
        return;
      }

      const data = await res.json();
      const recs = Array.isArray(data) ? data : (data.recommendations ?? []);
      setRecommendations(recs);
      setShowModal(true);
    } catch (e) {
      setApiError({
        type: "network",
        message:
          "Could not reach the server. Check your connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [bans, radiantPicks, direPicks, myTeam, apiUrl, accountId, canQuery, selectedRole]);

  const clearAll = () => {
    setBans([]);
    setRadiantPicks([]);
    setDirePicks([]);
    setRecommendations(null);
    setApiError(null);
    setShowModal(false);
    setSelectedRole("any");
  };

  return {
    selectedRole,
    setSelectedRole,
    bans,
    setBans,
    radiantPicks,
    setRadiantPicks,
    direPicks,
    setDirePicks,
    myTeam,
    setMyTeam,
    recommendations,
    loading,
    apiError,
    setApiError,
    showModal,
    setShowModal,
    canQuery,
    allUsed,
    addTo,
    removeFrom,
    fetchRecommendations,
    clearAll,
  };
}
