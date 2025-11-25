// frontend/src/pages/RegisterProperty.jsx
import React, { useState } from "react";
import { getContractWithSigner, getCurrentWallet } from "../utils/ethereum";

const RegisterProperty = () => {
  const [form, setForm] = useState({
    landId: "",
    ownerName: "",
    nationalId: "",
    titleNumber: "",
    location: "",
    size: "",
    landType: "",
    proposedNewOwner: "",
  });

  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const {
        landId,
        ownerName,
        nationalId,
        titleNumber,
        location,
        size,
        landType,
      } = form;

      const landIdNum = Number(landId);

      if (!landIdNum) {
        alert("Land ID must be a valid number.");
        setSubmitting(false);
        return;
      }

      const wallet = await getCurrentWallet();
      if (!wallet) {
        alert("Please connect your wallet first.");
        setSubmitting(false);
        return;
      }

      const contract = await getContractWithSigner();
      if (!contract) {
        alert("Could not connect to the contract. Check wallet/network.");
        setSubmitting(false);
        return;
      }

      const tx = await contract.requestLandRegistration(
        landIdNum,
        ownerName.trim(),
        nationalId.trim(),
        titleNumber.trim(),
        location.trim(),
        size.trim(),
        landType.trim()
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
    } catch (err) {
      console.error("On-chain registration failed:", err);
      alert(
        "On-chain registration failed. Please check the console for details. " +
          "No local fallback has been used."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Register Land / New Property
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium mb-1">
            Land ID *
          </label>
          <input
            type="number"
            name="landId"
            value={form.landId}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Owner Name *
          </label>
          <input
            type="text"
            name="ownerName"
            value={form.ownerName}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            National ID *
          </label>
          <input
            type="text"
            name="nationalId"
            value={form.nationalId}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Title Number *
          </label>
          <input
            type="text"
            name="titleNumber"
            value={form.titleNumber}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Location *
          </label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Size *
          </label>
          <input
            type="text"
            name="size"
            value={form.size}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Land Type *
          </label>
          <input
            type="text"
            name="landType"
            value={form.landType}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        <p className="text-xs text-gray-600">
          Note: This system now relies entirely on the blockchain. If a
          transaction fails or is rejected in MetaMask, no data is stored.
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Registration Request"}
        </button>
      </form>
    </div>
  );
};

export default RegisterProperty;
