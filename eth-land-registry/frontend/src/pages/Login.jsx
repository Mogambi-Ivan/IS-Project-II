import { useUser } from "../context/UserContext";

export default function Login() {
  const { loginAs } = useUser();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4 text-green-700">
          Kenya Land Registry Portal
        </h1>
        <p className="text-gray-600 mb-6">Select your Login Role</p>

        <button 
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded mb-3"
          onClick={() => loginAs("admin")}
        >
          Government Official Login
        </button>

        <button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          onClick={() => loginAs("owner")}
        >
          Land Owner Login
        </button>
      </div>
    </div>
  );
}
