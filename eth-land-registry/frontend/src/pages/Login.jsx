// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import { useUser } from "../context/UserContext";
import {
  getCurrentWallet,
  getContractReadOnly,
  getContractWithSigner,
} from "../utils/ethereum";

export default function Login() {
  const { login } = useUser();

  const [wallet, setWallet] = useState("");
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [checkingOnChain, setCheckingOnChain] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    nationalId: "",
    role: "owner", // "owner" or "government"
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function mapOnChainRoleToUi(roleValue) {
    const n = Number(roleValue);
    if (n === 2) return "government";
    if (n === 1) return "owner";
    return "owner";
  }

  async function handleConnectWallet() {
    setError("");
    setLoadingWallet(true);
    setShowForm(false);

    try {
      const w = await getCurrentWallet();
      if (!w) {
        setError("Please unlock MetaMask and try again.");
        return;
      }

      const lower = w.toLowerCase();
      setWallet(lower);

      // Check on-chain whether this wallet is already registered
      setCheckingOnChain(true);
      const contract = await getContractReadOnly();
      if (!contract) {
        setError("Could not reach the contract. Check network.");
        return;
      }

      const user = await contract.users(lower);
      // user: [name, nationalId, role, exists]

      if (user.exists) {
        // Already registered → log them straight in
        const profile = {
          wallet: lower,
          name: user.name,
          nationalId: user.nationalId,
          role: mapOnChainRoleToUi(user.role),
        };
        login(profile);
      } else {
        // New wallet → show registration form
        setShowForm(true);
      }
    } catch (err) {
      console.error("Wallet connect / user check error:", err);
      setError("Failed to connect wallet or read on-chain user. Try again.");
    } finally {
      setLoadingWallet(false);
      setCheckingOnChain(false);
    }
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
      const contract = await getContractWithSigner();
      if (!contract) {
        setError("Could not reach contract with signer. Check MetaMask.");
        setSaving(false);
        return;
      }

      // Role enum: 0=None, 1=Owner, 2=Government
      const roleEnum = form.role === "government" ? 2 : 1;

      const tx = await contract.registerUser(
        form.name.trim(),
        form.nationalId.trim(),
        roleEnum
      );
      await tx.wait();

      // Read back the on-chain user to be sure
      const user = await contract.users(wallet);
      const profile = {
        wallet,
        name: user.name,
        nationalId: user.nationalId,
        role: mapOnChainRoleToUi(user.role),
      };

      login(profile);
    } catch (err) {
      console.error("On-chain registration failed:", err);
      setError(
        "Registration transaction failed. Check console / MetaMask and try again."
      );
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
          Web3 login with on-chain citizen registration
        </p>

        {/* Step 1: Connect wallet & check on-chain user */}
        <div className="mb-6">
          <button
            onClick={handleConnectWallet}
            disabled={loadingWallet || checkingOnChain}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-60"
          >
            {loadingWallet || checkingOnChain
              ? "Connecting & checking user..."
              : "1. Connect Wallet"}
          </button>

          {isWalletConnected && (
            <p className="mt-2 text-xs text-gray-700 break-all">
              Connected wallet:{" "}
              <span className="font-mono">{wallet}</span>
            </p>
          )}
        </div>

        {/* Step 2: Registration form only for new wallets */}
        {isWalletConnected && showForm && (
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
                <option value="government">Government Official</option>
              </select>
            </div>

            <p className="text-xs text-gray-500">
              Your name, ID and role are written to the smart contract and
              linked to your wallet address. All land records and transfers
              live on-chain.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#00331f] hover:bg-[#00492a] text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-60"
            >
              {saving ? "Registering on-chain..." : "2. Register & Enter System"}
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
