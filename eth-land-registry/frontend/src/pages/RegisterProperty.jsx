// frontend/src/pages/RegisterProperty.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterProperty() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ownerName: "",
    nationalId: "",
    titleNumber: "",
    location: "",
    size: "",
    landType: "",
    proposedNewOwner: "",   // ✅ new required field
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requests = JSON.parse(localStorage.getItem("landRequests") || "[]");

    // push full land request including proposed new owner
    requests.push(form);

    localStorage.setItem("landRequests", JSON.stringify(requests));

    alert("✅ Land registration request submitted!");
    navigate("/");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-[#003366]">
        Register New Land
      </h2>

      <form className="grid gap-4 w-full max-w-lg bg-white p-6 shadow rounded" onSubmit={handleSubmit}>
        
        <input name="ownerName" placeholder="Current Owner" className="p-2 border rounded"
          onChange={handleChange} required />

        <input name="proposedNewOwner" placeholder="Proposed New Owner" className="p-2 border rounded"
          onChange={handleChange} required />

        <input name="nationalId" placeholder="National ID Number" className="p-2 border rounded"
          onChange={handleChange} required />

        <input name="titleNumber" placeholder="Land Title Number" className="p-2 border rounded"
          onChange={handleChange} required />

        <input name="location" placeholder="Location (County, Estate)" className="p-2 border rounded"
          onChange={handleChange} required />

        <input name="size" placeholder="Size (sqm)" className="p-2 border rounded"
          onChange={handleChange} required />

        <select name="landType" className="p-2 border rounded" onChange={handleChange} required>
          <option value="">Select Land Type</option>
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Agricultural">Agricultural</option>
        </select>

        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          Submit Request
        </button>
      </form>
    </div>
  );
}
