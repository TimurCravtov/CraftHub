import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, KeyRound, Save, Edit, X, Store, Settings as SettingsIcon, Shield } from "lucide-react";
import Header from "../component/Header.jsx";
import { useSecurityContext } from '../context/securityContext.jsx';
import ManageShopsContent from './ManageShopsContent.jsx';
import {useAuthApi} from "../context/apiAuthContext.jsx";

export default function Settings() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    newEmail: "",
    newName: "",
    role: "buyer",
  });

  const {api} = useAuthApi();
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [qrCode, setQrCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [show2FAConfirm, setShow2FAConfirm] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);

  const navigate = useNavigate();
  const isSeller = user?.accountType === 'seller' || user?.role === 'seller';
  const is2FAEnabled = user?.twoFactorEnabled || user?.is2FAEnabled || false;
  const { sanitizeInput, sanitizeFormData } = useSecurityContext();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async (token) => {
      setLoading(true);
      try {
        const res = await api.get("/api/users/me", {
        });

        const userData = res.data;

        setUser(userData);
        setForm({
          currentPassword: "",
          newPassword: "",
          newEmail: userData.email || "",
          newName: userData.name || "",
          role: userData.accountType || userData.role || "buyer",
        });
      } catch (error) {
        console.error("Failed to fetch user data:", error);

        const localUser = JSON.parse(localStorage.getItem("user")) || {};
        setUser(localUser);
        setForm({
          currentPassword: "",
          newPassword: "",
          newEmail: localUser.email || "",
          newName: localUser.name || "",
          role: localUser.accountType || localUser.role || "buyer",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData(localStorage.getItem("accessToken"));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === 'newName') {
      sanitizedValue = sanitizeInput(value, 'name');
    } else if (name === 'currentPassword' || name === 'newPassword') {
      sanitizedValue = sanitizeInput(value, 'password');
    } else if (name === 'newEmail') {
      sanitizedValue = sanitizeInput(value, 'email');
    } else if (name === 'twoFactorCode') {
      sanitizedValue = sanitizeInput(value, '2fa');
    }

    if (name === 'twoFactorCode') {
      setTwoFactorCode(sanitizedValue);
    } else {
      setForm({ ...form, [name]: sanitizedValue });
    }
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    if (editing) {
      setForm({
        currentPassword: "",
        newPassword: "",
        newEmail: user?.email || "",
        newName: user?.name || "",
        role: user?.accountType || user?.role || "buyer",
      });
      setTwoFactorCode("");
      setShow2FAConfirm(false);
      setQrCode("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.newPassword && !form.newEmail && !form.newName && !form.role) {
      setMessage("Nothing to update");
      return;
    }
    if (!form.currentPassword) {
      setMessage("Please enter your current password to confirm changes.");
      return;
    }

    try {
      const sanitizedForm = sanitizeFormData(form);
      const body = {
        role: sanitizedForm.role || "buyer",
        currentPassword: sanitizedForm.currentPassword,
        newPassword: sanitizedForm.newPassword,
        newEmail: sanitizedForm.newEmail,
        newName: sanitizedForm.newName,
      };

      const res = await fetch("http://localhost:8080/api/auth/update-user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error((await res.text()) || "Update failed");

      const updatedUser = await res.json();
      const updatedUserData = {
        ...user,
        ...updatedUser,
        name: sanitizedForm.newName || user.name,
        accountType: sanitizedForm.role || user.accountType,
      };

      localStorage.setItem("user", JSON.stringify(updatedUserData));
      setUser(updatedUserData);
      setMessage("✅ Account updated successfully!");
      setEditing(false);
      setForm({
        currentPassword: "",
        newPassword: "",
        newEmail: updatedUserData.email || "",
        newName: updatedUserData.name || "",
        role: updatedUserData.accountType || updatedUserData.role || "buyer",
      });
    } catch (err) {
      setMessage("❌ " + (err.message || "Something went wrong"));
    }
  };

  const handle2FAToggle = async () => {
    if (is2FAEnabled) {
      try {
        setTwoFALoading(true);
        
        // Use the centralized API client
        await api.post("api/auth/me/disable-2fa");

        const updatedUser = { ...user, is2FAEnabled: false, twoFactorEnabled: false };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setMessage("✅ 2FA disabled successfully!");
        setShow2FAConfirm(false);
        setQrCode("");
        setTwoFactorCode("");
      } catch (err) {
        setMessage("❌ " + (err.response?.data?.error || err.message || "Failed to disable 2FA"));
      } finally {
        setTwoFALoading(false);
      }
    } else {
      try {
        setTwoFALoading(true);

        // Call your API instance
        const res = await api.post("api/auth/me/enable-2fa", {});

        // Assuming your API wrapper returns { data, status } like Axios
        const { qrCodeUrl } = res.data;
        console.log(res.data)
        setQrCode(`data:image/png;base64,${res.data.qrCode}`);
        setShow2FAConfirm(true);

      } catch (err) {
        setMessage("❌ " + (err.response?.data?.message || err.message || "Failed to setup 2FA"));
      } finally {
        setTwoFALoading(false);
      }

    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    if (!twoFactorCode) {
      setMessage("❌ Please enter the 2FA code");
      return;
    }

    try {
      setTwoFALoading(true);
      const sanitizedCode = sanitizeInput(twoFactorCode, '2fa');
      
      const res = await api.post("api/auth/me/confirm-2fa", { 
        code: sanitizedCode 
      });

      const updatedUser = { ...user, is2FAEnabled: true, twoFactorEnabled: true };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage("✅ 2FA enabled successfully!");
      setShow2FAConfirm(false);
      setQrCode("");
      setTwoFactorCode("");
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.error || err.message || "Invalid 2FA code"));
    } finally {
      setTwoFALoading(false);
    }
  };

  useEffect(() => {
    const handler = () => setUser(JSON.parse(localStorage.getItem("user")) || {});
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  if (loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <Header />
          <div className="max-w-lg mx-auto mt-16 p-8 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-200">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-600">Loading user data...</div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Header />
        <div className="max-w-4xl mx-auto mt-16 p-8 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Account Settings
            </h1>
            {activeTab === 'account' && (
                <button
                    onClick={handleEditToggle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        editing ? "bg-red-500 text-white hover:bg-red-600" : "bg-indigo-500 text-white hover:bg-indigo-600"
                    }`}
                >
                  {editing ? (
                      <>
                        <X className="h-4 w-4" />
                        Cancel
                      </>
                  ) : (
                      <>
                        <Edit className="h-4 w-4" />
                        Edit
                      </>
                  )}
                </button>
            )}
          </div>

          <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
            <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'account' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <SettingsIcon className="h-4 w-4" />
              Account Details
            </button>
            {isSeller && (
                <button
                    onClick={() => setActiveTab('shops')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                        activeTab === 'shops' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <Store className="h-4 w-4" />
                  Manage Shops
                </button>
            )}
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg border shadow-sm">
            <p className="flex items-center gap-2 text-gray-700">
              <User className="h-5 w-5 text-indigo-500" />
              <span className="font-medium">Name:</span> {user?.name || "N/A"}
            </p>
            <p className="flex items-center gap-2 text-gray-700 mt-2">
              <Mail className="h-5 w-5 text-indigo-500" />
              <span className="font-medium">Email:</span> {user?.email || "N/A"}
            </p>
            <p className="flex items-center gap-2 text-gray-700 mt-2">
              <span className="font-medium">Role:</span> {user?.accountType || user?.role || "buyer"}
            </p>
            <p className="flex items-center gap-2 text-gray-700 mt-2">
              <Shield className="h-5 w-5 text-indigo-500" />
              <span className="font-medium">2FA:</span> {is2FAEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>

          {activeTab === 'account' && (
              <>
                {editing && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Choose Role</label>
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 shadow-sm focus:ring-2 focus:ring-indigo-400"
                        >
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                        <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400">
                          <Lock className="h-5 w-5 text-gray-400 mr-2" />
                          <input
                              type="password"
                              name="currentPassword"
                              value={form.currentPassword}
                              onChange={handleChange}
                              className="flex-1 bg-transparent outline-none"
                              required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">New Name</label>
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

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
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

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">New Email</label>
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

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Two-Factor Authentication</label>
                        <button
                            type="button"
                            onClick={handle2FAToggle}
                            disabled={twoFALoading}
                            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all ${
                                twoFALoading
                                    ? "bg-gray-400 text-white cursor-not-allowed"
                                    : is2FAEnabled
                                        ? "bg-red-600 text-white hover:bg-red-700"
                                        : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                        >
                          <Shield className="h-5 w-5" />
                          {twoFALoading ? "Processing..." : is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                        </button>
                      </div>

                      {show2FAConfirm && (
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-2">
                                Scan this QR code with your authenticator app:
                              </p>
                              <img src={qrCode} alt="2FA QR Code" className="mx-auto w-48 h-48" />
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-1">Enter 2FA Code</label>
                              <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-indigo-400">
                                <Shield className="h-5 w-5 text-gray-400 mr-2" />
                                <input
                                    type="text"
                                    name="twoFactorCode"
                                    value={twoFactorCode}
                                    onChange={handleChange}
                                    placeholder="Enter 6-digit code"
                                    className="flex-1 bg-transparent outline-none"
                                />
                              </div>
                            </div>
                            <button
                                type="button"
                                onClick={handle2FASubmit}
                                disabled={twoFALoading}
                                className={`w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all ${
                                    twoFALoading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                              <Save className="h-5 w-5" />
                              Verify 2FA Code
                            </button>
                          </div>
                      )}

                      <button
                          type="submit"
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
                      >
                        <Save className="h-5 w-5" /> Save Changes
                      </button>
                    </form>
                )}
              </>
          )}

          {activeTab === 'shops' && <ManageShopsContent />}

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