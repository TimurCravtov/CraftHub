import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, KeyRound, Save, Edit, Check, X } from "lucide-react";
import Header from "../component/Header.jsx";
import { useSecurityContext } from '../context/securityContext.jsx';

export default function Settings() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    newName: "",
  });
  const [message, setMessage] = useState("");

  const [qrCode, setQrCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [show2FAConfirm, setShow2FAConfirm] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isGoogleUser = user?.provider === "google";
  const { sanitizeInput } = useSecurityContext();

  // Fetch user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/api/users/me", {
          headers: {
            "Authorization": `Bearer ${user.token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        
        const data = await response.json();
        setUserData(data);
        
        // Pre-populate form with current user data
        setForm(prev => ({
          ...prev,
          newName: data.name || ""
        }));
        
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage("Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchUserData();
    }
  }, [user?.token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    
    // Apply appropriate sanitization based on field type
    if (name === 'newName') {
      sanitizedValue = sanitizeInput(value, 'name');
    } else if (name === 'currentPassword' || name === 'newPassword') {
      sanitizedValue = sanitizeInput(value, 'password');
    }
    
    setForm({ ...form, [name]: sanitizedValue });
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    if (!editing) {
      // Reset form when starting to edit
      setForm({
        currentPassword: "",
        newPassword: "",
        newName: userData?.name || ""
      });
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setForm({
      currentPassword: "",
      newPassword: "",
      newName: userData?.name || ""
    });
    setMessage("");
  };

  // --- Update User ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.newPassword && !form.newName) {
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
      if (form.newName) body.newName = form.newName;

      const res = await fetch("http://localhost:8080/api/auth/update-user", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(await res.text() || "Update failed");

      const updatedUser = await res.json();
      localStorage.setItem("user", JSON.stringify({ ...user, ...updatedUser }));
      
      // Update local userData state
      setUserData(prev => ({
        ...prev,
        name: form.newName || prev.name
      }));
      
      setMessage("✅ Account updated successfully!");
      setEditing(false);
      setForm({ currentPassword: "", newPassword: "", newName: "" });
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

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading user data...</p>
          </div>
        ) : (
          <>
            {/* User Info Display */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Profile Information</h2>
                {!editing ? (
                  <button
                    onClick={handleEditToggle}
                    className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-5 w-5 text-indigo-500" />
                  <span className="font-medium">Name:</span> 
                  {editing ? (
                    <input 
                      type="text" 
                      name="newName" 
                      value={form.newName} 
                      onChange={handleChange}
                      className="flex-1 border rounded px-2 py-1 bg-white"
                      placeholder="Enter new name"
                    />
                  ) : (
                    <span>{userData?.name || "N/A"}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="h-5 w-5 text-indigo-500" />
                  <span className="font-medium">Email:</span> 
                  <span className="text-gray-600">{userData?.email || "N/A"}</span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">Read-only</span>
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            {editing && !isGoogleUser && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-md font-semibold text-blue-800 mb-3">Change Password</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                    <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-400">
                      <Lock className="h-5 w-5 text-gray-400 mr-2" />
                      <input 
                        type="password" 
                        name="currentPassword" 
                        value={form.currentPassword} 
                        onChange={handleChange} 
                        className="flex-1 bg-transparent outline-none" 
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                    <div className="flex items-center border rounded-lg px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-400">
                      <KeyRound className="h-5 w-5 text-gray-400 mr-2" />
                      <input 
                        type="password" 
                        name="newPassword" 
                        value={form.newPassword} 
                        onChange={handleChange} 
                        className="flex-1 bg-transparent outline-none" 
                        placeholder="Enter new password (leave empty to keep current)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}


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
