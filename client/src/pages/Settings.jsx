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

      const res = await fetch("https://localhost:8443/api/auth/update-user", {
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
        <div className="page-loading page-loading--gradient">
          <Header />
          <div className="settings-loading-container">
            <div className="settings-loading-content">
              <div className="settings-loading-text">Loading user data...</div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="settings-page futuristic-page-base">
        <Header />
        <div className="settings-container">
          <div className="settings-header">
            <h1 className="settings-title">
              Account Settings
            </h1>
            {activeTab === 'account' && (
                <button
                    onClick={handleEditToggle}
                    className={editing ? "btn-secondary settings-edit-btn settings-edit-btn--cancel" : "btn-primary settings-edit-btn settings-edit-btn--edit"}
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

          <div className="settings-tabs">
            <button
                onClick={() => setActiveTab('account')}
                className={activeTab === 'account' ? 'settings-tab is-active' : 'settings-tab'}
            >
              <SettingsIcon className="h-4 w-4" />
              Account Details
            </button>
            {isSeller && (
                <button
                    onClick={() => setActiveTab('shops')}
                    className={activeTab === 'shops' ? 'settings-tab is-active' : 'settings-tab'}
                >
                  <Store className="h-4 w-4" />
                  Manage Shops
                </button>
            )}
          </div>

          <div className="settings-user-info">
            <p className="settings-user-info-item">
              <User className="h-5 w-5 text-indigo-500" />
              <span className="settings-user-info-label">Name:</span> {user?.name || "N/A"}
            </p>
            <p className="settings-user-info-item">
              <Mail className="h-5 w-5 text-indigo-500" />
              <span className="settings-user-info-label">Email:</span> {user?.email || "N/A"}
            </p>
            <p className="settings-user-info-item">
              <span className="settings-user-info-label">Role:</span> {user?.accountType || user?.role || "buyer"}
            </p>
            <p className="settings-user-info-item">
              <Shield className="h-5 w-5 text-indigo-500" />
              <span className="settings-user-info-label">2FA:</span> {is2FAEnabled ? "Enabled" : "Disabled"}
            </p>
          </div>

          {activeTab === 'account' && (
              <>
                {editing && (
                    <form onSubmit={handleSubmit} className="settings-form">
                      <div className="settings-field">
                        <label className="settings-label">Choose Role</label>
                        <select
                            name="role"
                            value={form.role}
                            onChange={handleChange}
                            className="settings-select"
                        >
                          <option value="buyer">Buyer</option>
                          <option value="seller">Seller</option>
                        </select>
                      </div>

                      <div className="settings-field">
                        <label className="settings-label">Current Password</label>
                        <div className="settings-input-wrapper">
                          <Lock className="h-5 w-5 text-gray-400 mr-2" />
                          <input
                              type="password"
                              name="currentPassword"
                              value={form.currentPassword}
                              onChange={handleChange}
                              className="settings-input"
                              required
                          />
                        </div>
                      </div>

                      <div className="settings-field">
                        <label className="settings-label">New Name</label>
                        <div className="settings-input-wrapper">
                          <User className="h-5 w-5 text-gray-400 mr-2" />
                          <input
                              type="text"
                              name="newName"
                              value={form.newName}
                              onChange={handleChange}
                              placeholder="Leave empty if unchanged"
                              className="settings-input"
                          />
                        </div>
                      </div>

                      <div className="settings-field">
                        <label className="settings-label">New Password</label>
                        <div className="settings-input-wrapper">
                          <KeyRound className="h-5 w-5 text-gray-400 mr-2" />
                          <input
                              type="password"
                              name="newPassword"
                              value={form.newPassword}
                              onChange={handleChange}
                              placeholder="Leave empty if unchanged"
                              className="settings-input"
                          />
                        </div>
                      </div>

                      <div className="settings-field">
                        <label className="settings-label">New Email</label>
                        <div className="settings-input-wrapper">
                          <Mail className="h-5 w-5 text-gray-400 mr-2" />
                          <input
                              type="email"
                              name="newEmail"
                              value={form.newEmail}
                              onChange={handleChange}
                              placeholder="Leave empty if unchanged"
                              className="settings-input"
                          />
                        </div>
                      </div>

                      <div className="settings-field">
                        <label className="settings-label">Two-Factor Authentication</label>
                        <button
                            type="button"
                            onClick={handle2FAToggle}
                            disabled={twoFALoading}
                            className={twoFALoading
                                ? "settings-2fa-btn"
                                : is2FAEnabled
                                    ? "settings-2fa-btn settings-2fa-btn--disable"
                                    : "settings-2fa-btn settings-2fa-btn--enable"}
                        >
                          <Shield className="h-5 w-5" />
                          {twoFALoading ? "Processing..." : is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                        </button>
                      </div>

                      {show2FAConfirm && (
                          <div className="settings-2fa-section">
                            <div>
                              <p className="settings-2fa-instructions">
                                Scan this QR code with your authenticator app:
                              </p>
                              <img src={qrCode} alt="2FA QR Code" className="settings-2fa-qr" />
                            </div>
                            <div className="settings-field">
                              <label className="settings-label">Enter 2FA Code</label>
                              <div className="settings-input-wrapper">
                                <Shield className="h-5 w-5 text-gray-400 mr-2" />
                                <input
                                    type="text"
                                    name="twoFactorCode"
                                    value={twoFactorCode}
                                    onChange={handleChange}
                                    placeholder="Enter 6-digit code"
                                    className="settings-input"
                                />
                              </div>
                            </div>
                            <button
                                type="button"
                                onClick={handle2FASubmit}
                                disabled={twoFALoading}
                                className="btn-primary settings-2fa-verify-btn"
                            >
                              <Save className="h-5 w-5" />
                              Verify 2FA Code
                            </button>
                          </div>
                      )}

                      <button
                          type="submit"
                          className="btn-primary settings-submit-btn"
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
                  className={`settings-message ${
                      message.startsWith("✅") ? "settings-message--success" : "settings-message--error"
                  }`}
              >
                {message}
              </p>
          )}
        </div>
      </div>
  );
}