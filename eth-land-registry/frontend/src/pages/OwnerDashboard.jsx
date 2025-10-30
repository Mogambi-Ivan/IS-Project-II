import PropertyCard from "../components/PropertyCard";

export default function OwnerDashboard() {
  const properties = [
    { id: 1, owner: "0x123...", location: "Nairobi", size: "200 sqm" },
    { id: 2, owner: "0x456...", location: "Mombasa", size: "150 sqm" },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Registered Properties</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((p) => (
          <PropertyCard key={p.id} {...p} />
        ))}
      </div>
    </div>
  );
}
