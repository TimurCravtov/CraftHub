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

  const [qrCode, setQrCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [show2FAConfirm, setShow2FAConfirm] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isGoogleUser = user?.provider === "google";

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // --- Update User ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.newPassword && !form.newEmail && !form.newName) {
      setMessage("Nothing to update");
      return;
    }
    if (!form.currentPassword && !isGoogleUser) {
      setMessage("Please enter your current password to confirm changes.");
      return;
    }

    try {
      const body = {};
      if (!isGoogleUser) body.currentPassword = form.currentPassword;
      if (form.newPassword && !isGoogleUser) body.newPassword = form.newPassword;
      if (form.newEmail && !isGoogleUser) body.newEmail = form.newEmail;
      if (form.newName) body.newName = form.newName;

      const res = await fetch("http://localhost:8080/api/auth/update-user", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text() || "Update failed");

      const updatedUser = await res.json();
      localStorage.setItem("user", JSON.stringify({ ...user, ...updatedUser }));
      setMessage("✅ Account updated successfully!");
      navigate("/");
    } catch (err) {
      setMessage("❌ " + (err.message || "Something went wrong"));
    }
  };

  // --- Enable 2FA (get QR code) ---
  const handleEnable2FA = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/me/enable-2fa", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (!res.ok) throw new Error("Failed to enable 2FA");

      const qrBase64 = await res.text();
      setQrCode(qrBase64);
      setShow2FAConfirm(true);
      setMessage("Scan the QR code in Google Authenticator and enter the first code below.");
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  // --- Confirm 2FA ---
  const handleConfirm2FA = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/auth/me/confirm-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ code: twoFactorCode }),
      });

      if (!res.ok) throw new Error(await res.text() || "Failed to confirm 2FA");

      setMessage("✅ 2FA successfully activated!");
      setQrCode("");
      setTwoFactorCode("");
      setShow2FAConfirm(false);

      // Update local user state
      localStorage.setItem("user", JSON.stringify({ ...user, twoFactorEnabled: true }));
    } catch (err) {
      setMessage("❌ " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />

      <div className="max-w-lg mx-auto mt-16 p-8 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-200">
        <h1 className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Account Settings
        </h1>

        {/* User Info */}
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

        {/* Update Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isGoogleUser && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
              <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400">
                <Lock className="h-5 w-5 text-gray-400 mr-2" />
                <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} className="flex-1 bg-transparent outline-none" />
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">New Name</label>
            <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <input type="text" name="newName" value={form.newName} onChange={handleChange} placeholder="Leave empty if unchanged" className="flex-1 bg-transparent outline-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
            <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400">
              <KeyRound className="h-5 w-5 text-gray-400 mr-2" />
              <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} placeholder={isGoogleUser ? "Not available for Google login" : "Leave empty if unchanged"} className="flex-1 bg-transparent outline-none" disabled={isGoogleUser} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">New Email</label>
            <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400">
              <Mail className="h-5 w-5 text-gray-400 mr-2" />
              <input type="email" name="newEmail" value={form.newEmail} onChange={handleChange} placeholder={isGoogleUser ? "Not available for Google login" : "Leave empty if unchanged"} className="flex-1 bg-transparent outline-none" disabled={isGoogleUser} />
            </div>
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all">
            <Save className="h-5 w-5" /> Save Changes
          </button>
        </form>

        {/* Enable 2FA */}
        {!user.twoFactorEnabled && !show2FAConfirm && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50 text-center">
            <p className="mb-2 font-medium text-gray-700">Enable Two-Factor Authentication</p>
            <button onClick={handleEnable2FA} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Enable 2FA</button>
          </div>
        )}

        {/* QR Code + Confirm */}
        {show2FAConfirm && (
          <div className="mt-6 p-4 border rounded-lg bg-gray-50 text-center">
            <p className="mb-2 font-medium text-gray-700">Scan this QR code in Google Authenticator</p>
            <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" className="mx-auto mb-4" />

            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full text-center mb-2"
            />
            <button onClick={handleConfirm2FA} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full">
              Confirm 2FA
            </button>
          </div>
        )}

        {/* Messages */}
        {message && (
          <p className={`mt-6 text-center text-sm font-medium ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
