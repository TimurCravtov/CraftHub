import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, KeyRound, Save, Edit, X } from "lucide-react";
import Header from "../component/Header.jsx";
import { useSecurityContext } from '../context/securityContext.jsx';

export default function Settings() {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    newEmail: "",
    newName: "",
    role: "buyer", // default buyer
  });
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [qrCode, setQrCode] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [show2FAConfirm, setShow2FAConfirm] = useState(false);

  const navigate = useNavigate();
  const isGoogleUser = user?.provider === "google";
  const { sanitizeInput, sanitizeFormData } = useSecurityContext();

  // Fetch user data from database on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Try to get token from different possible locations
        let token = null;
        const authData = localStorage.getItem("auth");
        const userData = localStorage.getItem("user");
        
        if (authData) {
          const parsed = JSON.parse(authData);
          token = parsed.token || parsed.accessToken;
        } else if (userData) {
          const parsed = JSON.parse(userData);
          token = parsed.token || parsed.accessToken;
        }
        
        if (!token) {
          navigate("/signup");
          return;
        }

        const response = await fetch("http://localhost:8080/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          // Initialize form with current user data
          setForm({
            currentPassword: "",
            newPassword: "",
            newEmail: userData.email || "",
            newName: userData.name || "",
            role: userData.accountType || userData.role || "buyer",
          });
        } else {
          console.error("Failed to fetch user data");
          // Fallback to localStorage data
          const localUser = JSON.parse(localStorage.getItem("user")) || {};
          setUser(localUser);
          setForm({
            currentPassword: "",
            newPassword: "",
            newEmail: localUser.email || "",
            newName: localUser.name || "",
            role: localUser.accountType || localUser.role || "buyer",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Fallback to localStorage data
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

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    
    // Apply appropriate sanitization based on field type
    if (name === 'newName') {
      sanitizedValue = sanitizeInput(value, 'name');
    } else if (name === 'currentPassword' || name === 'newPassword') {
      sanitizedValue = sanitizeInput(value, 'password');
    } else if (name === 'newEmail') {
      sanitizedValue = sanitizeInput(value, 'email');
    }
    
    setForm({ ...form, [name]: sanitizedValue });
  };

  const handleEditToggle = () => {
    setEditing(!editing);
    if (editing) {
      // Reset form to original user data when canceling edit
      setForm({
        currentPassword: "",
        newPassword: "",
        newEmail: user?.email || "",
        newName: user?.name || "",
        role: user?.accountType || user?.role || "buyer",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !form.newPassword &&
      !form.newEmail &&
      !form.newName &&
      !form.role
    ) {
      setMessage("Nothing to update");
      return;
    }
    if (!form.currentPassword && !isGoogleUser) {
      setMessage("Please enter your current password to confirm changes.");
      return;
    }

    try {
      // Sanitize form data before sending
      const sanitizedForm = sanitizeFormData(form);
      
      const body = { role: sanitizedForm.role || "buyer" };
      if (!isGoogleUser) body.currentPassword = sanitizedForm.currentPassword;
      if (sanitizedForm.newPassword && !isGoogleUser)
        body.newPassword = sanitizedForm.newPassword;
      if (sanitizedForm.newEmail && !isGoogleUser) body.newEmail = sanitizedForm.newEmail;
      if (sanitizedForm.newName) body.newName = sanitizedForm.newName;

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

      // Update local user with sanitized data
      const updatedUserData = {
        ...user, 
        ...updatedUser,
        name: sanitizedForm.newName || user.name,
        accountType: sanitizedForm.role || user.accountType
      };
      
      localStorage.setItem("user", JSON.stringify(updatedUserData));
      setUser(updatedUserData);
      setMessage("✅ Account updated successfully!");
      setEditing(false); // Exit edit mode after successful update
      
      // Reset form
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

  // ascultăm modificări în localStorage pentru re-render în Header
  useEffect(() => {
    const handler = () =>
      setUser(JSON.parse(localStorage.getItem("user")) || {});
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

      <div className="max-w-lg mx-auto mt-16 p-8 bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Account Settings
          </h1>
          <button
            onClick={handleEditToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              editing
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-indigo-500 text-white hover:bg-indigo-600"
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
            <span className="font-medium">Role:</span>{" "}
            {user?.accountType || user?.role || "buyer"}
          </p>
        </div>

        {editing && (
          <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Choose Role
            </label>
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

          {!isGoogleUser && (
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
          )}

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
                placeholder={
                  isGoogleUser
                    ? "Not available for Google login"
                    : "Leave empty if unchanged"
                }
                className="flex-1 bg-transparent outline-none"
                disabled={isGoogleUser}
              />
            </div>
          </div>

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
                placeholder={
                  isGoogleUser
                    ? "Not available for Google login"
                    : "Leave empty if unchanged"
                }
                className="flex-1 bg-transparent outline-none"
                disabled={isGoogleUser}
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
        )}

        {message && (
          <p
            className={`mt-6 text-center text-sm font-medium ${
              message.startsWith("✅")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}