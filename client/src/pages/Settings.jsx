import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, KeyRound, Save, Store, Settings as SettingsIcon, Shield, Package, ChevronRight } from "lucide-react";
import Header from "../component/Header.jsx";
import { useSecurityContext } from '../context/securityContext.jsx';
import ManageShopsContent from './ManageShopsContent.jsx';
import ManageOrdersContent from './ManageOrdersContent.jsx';
import { useAuthApi } from "../context/apiAuthContext.jsx";

export default function Settings() {
  const { api, setUser: setGlobalUser } = useAuthApi();
  const { sanitizeInput, sanitizeFormData } = useSecurityContext();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [message, setMessage] = useState("");
  
  // Form state
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    newEmail: "",
    newName: "",
    role: "buyer",
  });

  // 2FA state
  const [qrCode, setQrCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [show2FAConfirm, setShow2FAConfirm] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);

  const isSeller = (user?.accountType || user?.role || "").toLowerCase() === 'seller';
  const isLocalUser = user?.provider === 'LOCAL';
  const is2FAEnabled = user?.twoFactorEnabled || user?.is2FAEnabled || false;

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/users/me");
        const userData = res.data;
        setUser(userData);
        setForm(prev => ({
          ...prev,
          newEmail: userData.email || "",
          newName: userData.name || "",
          role: (userData.accountType || userData.role || "buyer").toLowerCase(),
        }));
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        const localUser = JSON.parse(localStorage.getItem("user")) || {};
        setUser(localUser);
        setForm(prev => ({
          ...prev,
          newEmail: localUser.email || "",
          newName: localUser.name || "",
          role: (localUser.accountType || localUser.role || "buyer").toLowerCase(),
        }));
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [api]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;

    if (name === 'newName') sanitizedValue = sanitizeInput(value, 'name');
    else if (name === 'currentPassword' || name === 'newPassword') sanitizedValue = sanitizeInput(value, 'password');
    else if (name === 'newEmail') sanitizedValue = sanitizeInput(value, 'email');
    else if (name === 'twoFactorCode') sanitizedValue = sanitizeInput(value, '2fa');

    if (name === 'twoFactorCode') setTwoFactorCode(sanitizedValue);
    else setForm({ ...form, [name]: sanitizedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

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
      const updatedUser = { ...user, ...res.data };
      
      // Update local storage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      const auth = JSON.parse(localStorage.getItem("auth") || "{}");
      localStorage.setItem("auth", JSON.stringify({ ...auth, ...updatedUser }));

      setUser(updatedUser);
      if (setGlobalUser) setGlobalUser(updatedUser);

      setMessage("✅ Settings updated successfully!");
      setForm(prev => ({ ...prev, currentPassword: "", newPassword: "" }));
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.message || err.message || "Update failed"));
    }
  };

  const handle2FAToggle = async () => {
    if (is2FAEnabled) {
      try {
        setTwoFALoading(true);
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
        const res = await api.post("api/auth/me/enable-2fa", {});
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
      await api.post("api/auth/me/confirm-2fa", { code: sanitizedCode });
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

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16533A]"></div></div>;

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    ...(isSeller ? [
      { id: 'shops', label: 'Manage Shops', icon: Store },
      { id: 'orders', label: 'Shop Orders', icon: Package }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#16533A]">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setMessage(""); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === tab.id 
                      ? 'bg-[#16533A] text-white shadow-md shadow-[#16533A]/20' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#16533A]'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                  {activeTab === tab.id && <ChevronRight className="h-4 w-4 ml-auto" />}
                </button>
              ))}
            </nav>
            
            {/* User Summary Card */}
            <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-[#16533A]/10 flex items-center justify-center text-[#16533A] font-bold text-xl">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{user?.name}</p>
                        <p className="text-sm text-gray-500 truncate max-w-[150px]">{user?.email}</p>
                    </div>
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Account Type</div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#16533A]/10 text-[#16533A]">
                    {user?.accountType || user?.role || "Buyer"}
                </div>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 min-h-[500px]">
            {activeTab === 'profile' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="border-b border-gray-100 pb-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                        <p className="text-gray-500 mt-1">Update your personal details and account type</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="newName"
                                        value={form.newName}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#16533A]/20 focus:border-[#16533A] transition-all outline-none"
                                        placeholder="Your Name"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="newEmail"
                                        value={form.newEmail}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#16533A]/20 focus:border-[#16533A] transition-all outline-none"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Account Role</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${form.role === 'buyer' ? 'border-[#16533A] bg-[#16533A]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="role" value="buyer" checked={form.role === 'buyer'} onChange={handleChange} className="sr-only" />
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900">Buyer</div>
                                        <div className="text-sm text-gray-500">Browse and purchase items</div>
                                    </div>
                                    {form.role === 'buyer' && <div className="h-5 w-5 rounded-full bg-[#16533A] flex items-center justify-center"><div className="h-2 w-2 bg-white rounded-full"></div></div>}
                                </label>
                                <label className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${form.role === 'seller' ? 'border-[#16533A] bg-[#16533A]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="role" value="seller" checked={form.role === 'seller'} onChange={handleChange} className="sr-only" />
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900">Seller</div>
                                        <div className="text-sm text-gray-500">Create shops and sell products</div>
                                    </div>
                                    {form.role === 'seller' && <div className="h-5 w-5 rounded-full bg-[#16533A] flex items-center justify-center"><div className="h-2 w-2 bg-white rounded-full"></div></div>}
                                </label>
                            </div>
                        </div>

                        {isLocalUser && (
                            <div className="pt-4 border-t border-gray-100">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password (Required to save changes)</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={form.currentPassword}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#16533A]/20 focus:border-[#16533A] transition-all outline-none"
                                        placeholder="Enter current password"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button type="submit" className="flex items-center gap-2 bg-[#16533A] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#12422e] transition-all shadow-lg shadow-[#16533A]/20">
                                <Save className="h-5 w-5" />
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="border-b border-gray-100 pb-6">
                        <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
                        <p className="text-gray-500 mt-1">Manage your password and two-factor authentication</p>
                    </div>

                    {isLocalUser && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={form.currentPassword}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#16533A]/20 focus:border-[#16533A] transition-all outline-none"
                                            placeholder="Current password"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={form.newPassword}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#16533A]/20 focus:border-[#16533A] transition-all outline-none"
                                            placeholder="New password"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="flex items-center gap-2 bg-[#16533A] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#12422e] transition-all shadow-md">
                                        <Save className="h-4 w-4" />
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="pt-8 border-t border-gray-100">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                                <p className="text-gray-500 text-sm mt-1">Add an extra layer of security to your account</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${is2FAEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {is2FAEnabled ? 'Enabled' : 'Disabled'}
                            </div>
                        </div>

                        {!show2FAConfirm ? (
                            <button
                                onClick={handle2FAToggle}
                                disabled={twoFALoading}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                                    is2FAEnabled
                                        ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                        : "bg-[#16533A] text-white hover:bg-[#12422e] shadow-lg shadow-[#16533A]/20"
                                }`}
                            >
                                <Shield className="h-5 w-5" />
                                {twoFALoading ? "Processing..." : is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                            </button>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 animate-in fade-in zoom-in-95">
                                <div className="flex flex-col md:flex-row gap-8 items-center">
                                    <div className="bg-white p-4 rounded-xl shadow-sm">
                                        <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <h4 className="font-semibold text-gray-900">Scan QR Code</h4>
                                        <p className="text-sm text-gray-600">Use your authenticator app (like Google Authenticator) to scan the QR code, then enter the 6-digit code below.</p>
                                        
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={twoFactorCode}
                                                onChange={(e) => setTwoFactorCode(e.target.value)}
                                                placeholder="000 000"
                                                className="w-40 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#16533A]/20 focus:border-[#16533A] outline-none text-center font-mono tracking-widest"
                                            />
                                            <button
                                                onClick={handle2FASubmit}
                                                disabled={twoFALoading}
                                                className="px-6 py-2.5 bg-[#16533A] text-white rounded-xl font-medium hover:bg-[#12422e] transition-all"
                                            >
                                                Verify
                                            </button>
                                            <button
                                                onClick={() => { setShow2FAConfirm(false); setQrCode(""); }}
                                                className="px-4 py-2.5 text-gray-500 hover:text-gray-700 font-medium"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'shops' && <ManageShopsContent />}
            {activeTab === 'orders' && <ManageOrdersContent />}

            {message && (
                <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
                    message.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
                } animate-in slide-in-from-bottom-2`}>
                    {message.startsWith("✅") ? <div className="h-2 w-2 rounded-full bg-green-500"></div> : <div className="h-2 w-2 rounded-full bg-red-500"></div>}
                    <p className="font-medium">{message}</p>
                </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}