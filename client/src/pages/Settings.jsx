import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, KeyRound, Save, Edit, X, Store, Settings as SettingsIcon, Shield, Package } from "lucide-react";
import Header from "../component/Header.jsx";
import { useSecurityContext } from '../context/securityContext.jsx';
import ManageShopsContent from './ManageShopsContent.jsx';
import ManageOrdersContent from './ManageOrdersContent.jsx';
import {useAuthApi} from "../context/apiAuthContext.jsx";

export default function Settings() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    newEmail: "",
    newName: "",
    role: "buyer",
  });

  const {api, setUser: setGlobalUser} = useAuthApi();
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
  const isSeller = (user?.accountType || user?.role || "").toLowerCase() === 'seller';
  const isLocalUser = user?.provider === 'LOCAL';
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
          role: (userData.accountType || userData.role || "buyer").toLowerCase(),
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
          role: (localUser.accountType || localUser.role || "buyer").toLowerCase(),
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
    if (isLocalUser && !form.currentPassword) {
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

      const res = await api.put("/api/auth/update-user", body);
      const updatedUser = res.data;
      const updatedUserData = {
        ...user,
        ...updatedUser,
        name: sanitizedForm.newName || user.name,
        accountType: sanitizedForm.role || user.accountType,
      };

      localStorage.setItem("user", JSON.stringify(updatedUserData));
      
      // Update auth in localStorage so other components see the change
      const auth = JSON.parse(localStorage.getItem("auth") || "{}");
      const newAuth = { ...auth, ...updatedUserData };
      localStorage.setItem("auth", JSON.stringify(newAuth));

      setUser(updatedUserData);
      if (setGlobalUser) setGlobalUser(updatedUserData);

      setMessage("✅ Account updated successfully!");
      setEditing(false);
      setForm({
        currentPassword: "",
        newPassword: "",
        newEmail: updatedUserData.email || "",
        newName: updatedUserData.name || "",
        role: (updatedUserData.accountType || updatedUserData.role || "buyer").toLowerCase(),
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
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-lg mx-auto mt-16 p-8 bg-white shadow-xl rounded-2xl border border-gray-100">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-600">Loading user data...</div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-5xl mx-auto mt-12 p-8 bg-white shadow-xl rounded-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[#16533A]">
              Account Settings
            </h1>
            {activeTab === 'account' && (
                <button
                    onClick={handleEditToggle}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                        editing ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-[#16533A] text-white hover:bg-[#12422e] shadow-lg shadow-[#16533A]/20"
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

          <div className="flex space-x-2 mb-8 bg-gray-100/50 p-1.5 rounded-xl w-fit">
            <button
                onClick={() => setActiveTab('account')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'account' ? 'bg-white text-[#16533A] shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <SettingsIcon className="h-4 w-4" />
              Account Details
            </button>
            {isSeller && (
                <>
                  <button
                      onClick={() => setActiveTab('shops')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                          activeTab === 'shops' ? 'bg-white text-[#16533A] shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    <Store className="h-4 w-4" />
                    Manage Shops
                  </button>
                  <button
                      onClick={() => setActiveTab('orders')}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                          activeTab === 'orders' ? 'bg-white text-[#16533A] shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                  >
                    <Package className="h-4 w-4" />
                    Manage Orders
                  </button>
                </>
            )}
          </div>

          <div className="mb-8 p-6 bg-gray-50/50 rounded-xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-white rounded-lg shadow-sm text-[#16533A]">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase tracking-wider font-semibold">Name</span>
                  <span className="font-medium text-lg">{user?.name || "N/A"}</span>
                </div>
              </p>
              <p className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-white rounded-lg shadow-sm text-[#16533A]">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase tracking-wider font-semibold">Email</span>
                  <span className="font-medium text-lg">{user?.email || "N/A"}</span>
                </div>
              </p>
              <p className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-white rounded-lg shadow-sm text-[#16533A]">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase tracking-wider font-semibold">Role</span>
                  <span className="font-medium text-lg capitalize">{user?.accountType || user?.role || "buyer"}</span>
                </div>
              </p>
              <p className="flex items-center gap-3 text-gray-700">
                <div className="p-2 bg-white rounded-lg shadow-sm text-[#16533A]">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-xs text-gray-500 uppercase tracking-wider font-semibold">Security</span>
                  <span className="font-medium text-lg">{is2FAEnabled ? "2FA Enabled" : "2FA Disabled"}</span>
                </div>
              </p>
            </div>
          </div>

          {activeTab === 'account' && (
              <>
                {editing && (
                    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="p-6 bg-[#16533A]/5 rounded-xl border border-[#16533A]/10">
                        <label className="block text-sm font-bold text-[#16533A] mb-3">Account Type</label>
                        <div className="flex items-center gap-6">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                              <input
                                  type="radio"
                                  name="role"
                                  value="buyer"
                                  checked={form.role === 'buyer'}
                                  onChange={handleChange}
                                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-gray-300 checked:border-[#16533A] transition-all"
                              />
                              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#16533A] opacity-0 peer-checked:opacity-100 transition-opacity"></span>
                            </div>
                            <span className="text-gray-700 font-medium group-hover:text-[#16533A] transition-colors">Buyer</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                              <input
                                  type="radio"
                                  name="role"
                                  value="seller"
                                  checked={form.role === 'seller'}
                                  onChange={handleChange}
                                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-gray-300 checked:border-[#16533A] transition-all"
                              />
                              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#16533A] opacity-0 peer-checked:opacity-100 transition-opacity"></span>
                            </div>
                            <span className="text-gray-700 font-medium group-hover:text-[#16533A] transition-colors">Seller (Enable Shop Management)</span>
                          </label>
                        </div>
                        <p className="text-sm text-[#16533A]/80 mt-3 font-medium">
                          {form.role === 'seller' 
                            ? "As a seller, you can create shops and list products." 
                            : "As a buyer, you can browse and purchase items."}
                        </p>
                      </div>

                      {isLocalUser && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                        <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#16533A]/20 focus-within:border-[#16533A] transition-all bg-white">
                          <Lock className="h-5 w-5 text-gray-400 mr-3" />
                          <input
                              type="password"
                              name="currentPassword"
                              value={form.currentPassword}
                              onChange={handleChange}
                              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                              required
                          />
                        </div>
                      </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">New Name</label>
                          <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#16533A]/20 focus-within:border-[#16533A] transition-all bg-white">
                            <User className="h-5 w-5 text-gray-400 mr-3" />
                            <input
                                type="text"
                                name="newName"
                                value={form.newName}
                                onChange={handleChange}
                                placeholder="Leave empty if unchanged"
                                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">New Email</label>
                          <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#16533A]/20 focus-within:border-[#16533A] transition-all bg-white">
                            <Mail className="h-5 w-5 text-gray-400 mr-3" />
                            <input
                                type="email"
                                name="newEmail"
                                value={form.newEmail}
                                onChange={handleChange}
                                placeholder="Leave empty if unchanged"
                                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                        <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#16533A]/20 focus-within:border-[#16533A] transition-all bg-white">
                          <KeyRound className="h-5 w-5 text-gray-400 mr-3" />
                          <input
                              type="password"
                              name="newPassword"
                              value={form.newPassword}
                              onChange={handleChange}
                              placeholder="Leave empty if unchanged"
                              className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Two-Factor Authentication</label>
                        <button
                            type="button"
                            onClick={handle2FAToggle}
                            disabled={twoFALoading}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                                twoFALoading
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : is2FAEnabled
                                        ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                        : "bg-[#16533A]/5 text-[#16533A] hover:bg-[#16533A]/10 border border-[#16533A]/20"
                            }`}
                        >
                          <Shield className="h-5 w-5" />
                          {twoFALoading ? "Processing..." : is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                        </button>
                      </div>

                      {show2FAConfirm && (
                          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-900 mb-4">
                                Scan this QR code with your authenticator app
                              </p>
                              <div className="bg-white p-4 rounded-xl shadow-sm inline-block">
                                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Enter 6-digit Code</label>
                              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#16533A]/20 focus-within:border-[#16533A] transition-all bg-white">
                                <Shield className="h-5 w-5 text-gray-400 mr-3" />
                                <input
                                    type="text"
                                    name="twoFactorCode"
                                    value={twoFactorCode}
                                    onChange={handleChange}
                                    placeholder="000 000"
                                    className="flex-1 bg-transparent outline-none text-center font-mono text-lg tracking-widest"
                                />
                              </div>
                            </div>
                            <button
                                type="button"
                                onClick={handle2FASubmit}
                                disabled={twoFALoading}
                                className={`w-full flex items-center justify-center gap-2 bg-[#16533A] text-white font-semibold py-3 rounded-xl shadow-lg shadow-[#16533A]/20 hover:bg-[#12422e] transition-all ${
                                    twoFALoading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                              <Save className="h-5 w-5" />
                              Verify & Enable
                            </button>
                          </div>
                      )}

                      <button
                          type="submit"
                          className="w-full flex items-center justify-center gap-2 bg-[#16533A] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#16533A]/20 hover:bg-[#12422e] hover:shadow-xl hover:shadow-[#16533A]/30 transition-all transform hover:-translate-y-0.5"
                      >
                        <Save className="h-5 w-5" /> Save Changes
                      </button>
                    </form>
                )}
              </>
          )}

          {activeTab === 'shops' && <ManageShopsContent />}
          {activeTab === 'orders' && <ManageOrdersContent />}

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