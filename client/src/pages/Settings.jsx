import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, KeyRound, Save } from "lucide-react";
import Header from "../component/Header.jsx";

export default function Settings() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    newEmail: "",
    newName: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.newPassword && !form.newEmail && !form.newName) {
      setMessage("Nothing to update");
      return;
    }

    if (!form.currentPassword) {
      setMessage("Please enter your current password to confirm changes.");
      return;
    }

    try {
      const body = { currentPassword: form.currentPassword };
      if (form.newPassword) body.newPassword = form.newPassword;
      if (form.newEmail) body.newEmail = form.newEmail;
      if (form.newName) body.newName = form.newName;

      const res = await fetch("http://localhost:8080/api/auth/update-user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Update failed");
      }

      const updatedUser = await res.json();

      // 🔹 păstrăm și token-urile existente
      const newUserData = {
        ...user,
        name: updatedUser.name,
        email: updatedUser.email,
      };

      localStorage.setItem("user", JSON.stringify(newUserData));

      setMessage("✅ Account updated successfully!");
      navigate("/");
    } catch (err) {
      setMessage("❌ " + (err.message || "Something went wrong"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />

      <div className="max-w-lg mx-auto mt-16 p-8 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-200">
        <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Account Settings
        </h1>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg border shadow-sm">
          <p className="flex items-center gap-2 text-gray-700">
            <User className="h-5 w-5 text-indigo-500" />
            <span className="font-medium">Name:</span> {user?.name || "N/A"}
          </p>
          <p className="flex items-center gap-2 text-gray-700 mt-2">
            <Mail className="h-5 w-5 text-indigo-500" />
            <span className="font-medium">Email:</span> {user?.email || "N/A"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Current Password
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400">
              <Lock className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="password"
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                className="flex-1 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* New Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              New Name
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                name="newName"
                value={form.newName}
                onChange={handleChange}
                placeholder="Leave empty if unchanged"
                className="flex-1 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              New Password
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400">
              <KeyRound className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Leave empty if unchanged"
                className="flex-1 bg-transparent outline-none"
              />
            </div>
          </div>

          {/* New Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              New Email
            </label>
            <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400">
              <Mail className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="email"
                name="newEmail"
                value={form.newEmail}
                onChange={handleChange}
                placeholder="Leave empty if unchanged"
                className="flex-1 bg-transparent outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <Save className="h-5 w-5" /> Save Changes
          </button>
        </form>

        {message && (
          <p
            className={`mt-6 text-center text-sm font-medium ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
