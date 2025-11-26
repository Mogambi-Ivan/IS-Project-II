// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import { getCurrentWallet } from "../utils/ethereum";

const PROFILE_KEY = "landRegistryProfiles";

function loadProfiles() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProfiles(profiles) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error("Failed to store profiles:", err);
  }
}

export default function Login() {
  const { login } = useUser();
  const [wallet, setWallet] = useState("");
  const [hasProfile, setHasProfile] = useState(false);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    nationalId: "",
    role: "owner",
  });

  async function handleConnectWallet() {
    setError("");
    setLoadingWallet(true);
    try {
      const w = await getCurrentWallet();
      if (!w) {
        setError("Please unlock MetaMask and try again.");
        return;
      }

      const lower = w.toLowerCase();
      setWallet(lower);

      const profiles = loadProfiles();
      const existing = profiles[lower];

      if (existing) {
        // Wallet already registered → log them straight in
        login(existing);
      } else {
        // New wallet → show registration form
        setHasProfile(false);
      }
    } catch (err) {
      console.error("Wallet connect error:", err);
      setError("Failed to connect wallet. Check MetaMask and try again.");
    } finally {
      setLoadingWallet(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (!wallet) {
      setError("Connect your wallet first.");
      return;
    }

    if (!form.name.trim() || !form.nationalId.trim()) {
      setError("Please fill in your full name and national ID.");
      return;
    }

    setSaving(true);
    try {
      const profiles = loadProfiles();

      const profile = {
        wallet,
        name: form.name.trim(),
        nationalId: form.nationalId.trim(),
        role: form.role, // "owner" or "admin"
      };

      profiles[wallet] = profile;
      saveProfiles(profiles);

      // Log into the app
      login(profile);
    } catch (err) {
      console.error("Failed to save registration:", err);
      setError("Could not save registration. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const isWalletConnected = Boolean(wallet);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3faf5]">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">
          Kenya Land Registry
        </h1>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Web3 login with digital ID registration
        </p>

        {/* Step 1: Connect wallet */}
        <div className="mb-6">
          <button
            onClick={handleConnectWallet}
            disabled={loadingWallet}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-60"
          >
            {loadingWallet ? "Connecting wallet..." : "1. Connect Wallet"}
          </button>

          {isWalletConnected && (
            <p className="mt-2 text-xs text-gray-700 break-all">
              Connected wallet:{" "}
              <span className="font-mono">{wallet}</span>
            </p>
          )}
        </div>

        {/* Step 2: Registration form (only if wallet is new) */}
        {isWalletConnected && !hasProfile && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="e.g. Grace Wambui"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                National ID / Passport
              </label>
              <input
                type="text"
                name="nationalId"
                value={form.nationalId}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 text-sm"
                placeholder="e.g. 26894521"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Role in the system
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 text-sm"
              >
                <option value="owner">Land Owner</option>
                <option value="admin">Government Official</option>
              </select>
            </div>

            <p className="text-xs text-gray-500">
              This registration links your identity details to your wallet
              address. Land records themselves are stored on the Ethereum smart contract.
            
            </p>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#00331f] hover:bg-[#00492a] text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-60"
            >
              {saving ? "Registering..." : "2. Register & Enter System"}
            </button>
          </form>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
