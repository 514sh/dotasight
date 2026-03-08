import { useState, useEffect } from "react";

const STORAGE_KEY = "dotasight_account_id";
const IGNORE_KEY = "dotasight_ignore_account_id";

export function useAccountId() {
  const [accountId, setAccountId] = useState("");
  const [ignored, setIgnored] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // On mount: load from localStorage, auto-open if never set
  useEffect(() => {
    const storedId = localStorage.getItem(STORAGE_KEY) ?? "";
    const storedIgnored = localStorage.getItem(IGNORE_KEY) === "true";
    setAccountId(storedId);
    setIgnored(storedIgnored);

    // Show modal on first visit — when user has neither set an ID nor chosen to skip
    const hasDecided = storedIgnored || storedId !== "";
    if (!hasDecided) {
      setShowModal(true);
    }
  }, []);

  const save = (id, ignore) => {
    const trimmed = id.trim();
    localStorage.setItem(STORAGE_KEY, trimmed);
    localStorage.setItem(IGNORE_KEY, String(ignore));
    setAccountId(trimmed);
    setIgnored(ignore);
    setShowModal(false);
  };

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(IGNORE_KEY);
    setAccountId("");
    setIgnored(false);
  };

  const activeAccountId = ignored || !accountId ? null : accountId;

  return {
    accountId,
    ignored,
    activeAccountId,
    showModal,
    setShowModal,
    save,
    clear,
  };
}
