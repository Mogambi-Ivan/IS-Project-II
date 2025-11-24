// frontend/src/pages/RegisterProperty.jsx
import React, { useState } from "react";
import { getContractWithSigner } from "../utils/ethereum"; 



const RegisterProperty = () => {
  const [form, setForm] = useState({
    landId: "",          // numeric
    ownerName: "",
    nationalId: "",
    titleNumber: "",
    location: "",
    size: "",
    landType: "",
    proposedNewOwner: "", // stays for mock/transfer UI, not used in registration tx
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    // Build payload for contract
    const payload = {
      landId: Number(form.landId),
      ownerName: form.ownerName.trim(),
      nationalId: form.nationalId.trim(),
      titleNumber: form.titleNumber.trim(),
      location: form.location.trim(),
      size: form.size.trim(),
      landType: form.landType.trim(),
    };

    // Basic validation (minimal)
    if (!payload.landId || !payload.ownerName || !payload.nationalId || !payload.titleNumber) {
      alert("Please fill all required fields (Land ID, Owner Name, National ID, Title Number).");
      setLoading(false);
      return;
    }

    try {
      // ---------- ON-CHAIN FIRST ----------
      const contract = await getContractWithSigner();
      if (!contract) throw new Error("No wallet/provider detected.");

      const tx = await contract.requestLandRegistration(
        payload.landId,
        payload.ownerName,
        payload.nationalId,
        payload.titleNumber,
        payload.location,
        payload.size,
        payload.landType
      );

      await tx.wait();

      alert("Land registration request submitted on-chain ✅");

      setForm({
        landId: "",
        ownerName: "",
        nationalId: "",
        titleNumber: "",
        location: "",
        size: "",
        landType: "",
        proposedNewOwner: "",
      });

      setLoading(false);
      return;
    } catch (err) {
      console.log("On-chain request failed. Falling back to mock/localStorage:", err);

      // ---------- MOCK FALLBACK ----------
      try {
        const existing = JSON.parse(localStorage.getItem("landRequests")) || [];

        const newRequest = {
          ...form,
          landId: payload.landId,
          status: "Pending",
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem("landRequests", JSON.stringify([...existing, newRequest]));

        alert("Wallet issue — request saved locally (mock) ✅");

        setForm({
          landId: "",
          ownerName: "",
          nationalId: "",
          titleNumber: "",
          location: "",
          size: "",
          landType: "",
          proposedNewOwner: "",
        });
      } catch (mockErr) {
        console.error("Mock save failed:", mockErr);
        alert("Both on-chain and mock save failed. Check console.");
      }

      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Register Land / New Property</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-xl shadow">
        {/* Land ID */}
        <div>
          <label className="block text-sm font-medium mb-1">Land ID *</label>
          <input
            type="number"
            name="landId"
            value={form.landId}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="e.g. 1001"
            required
          />
        </div>

        {/* Owner Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Owner Name *</label>
          <input
            type="text"
            name="ownerName"
            value={form.ownerName}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="Full name"
            required
          />
        </div>

        {/* National ID */}
        <div>
          <label className="block text-sm font-medium mb-1">National ID *</label>
          <input
            type="text"
            name="nationalId"
            value={form.nationalId}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="e.g. 12345678"
            required
          />
        </div>

        {/* Title Number */}
        <div>
          <label className="block text-sm font-medium mb-1">Title Number *</label>
          <input
            type="text"
            name="titleNumber"
            value={form.titleNumber}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="e.g. LR/NAI/0001"
            required
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="County / area"
          />
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium mb-1">Size</label>
          <input
            type="text"
            name="size"
            value={form.size}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="e.g. 0.5 acres"
          />
        </div>

        {/* Land Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Land Type</label>
          <select
            name="landType"
            value={form.landType}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          >
            <option value="">Select type</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Agricultural">Agricultural</option>
            <option value="Industrial">Industrial</option>
          </select>
        </div>

        {/* Proposed New Owner (for transfer mock / future use) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Proposed New Owner (Transfer only)
          </label>
          <input
            type="text"
            name="proposedNewOwner"
            value={form.proposedNewOwner}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            placeholder="Optional"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Registration Request"}
        </button>
      </form>
    </div>
  );
};

export default RegisterProperty;
