import { useState } from 'react'
import Header from '../component/Header.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const user = { email, password };

    try {
      const response = await fetch("http://localhost:8080/api/users/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      if (!response.ok) throw new Error("Failed to log in");

      const data = await response.json();
      alert("Login successful: " + JSON.stringify(data));

      // Reset form
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Error:", error);
      alert("Login failed. Please try again.");
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 space-y-6">
          <div className="text-left">
            <h1 className="text-lg font-medium text-black">LOGO</h1>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-black">Login</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-black">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full bg-gray-50/30 border border-gray-200/60 rounded-full px-6 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all placeholder:text-gray-400/60 hover:border-gray-300"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-black">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full bg-gray-50/30 border border-gray-200/60 rounded-full px-6 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all placeholder:text-gray-400/60 hover:border-gray-300"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-full transition-all duration-300 hover:scale-[1.02] shadow-lg"
              >
                Login
              </button>
            </form>

            <div className="text-center">
              <span className="text-sm text-black">
                Don't have an account?{' '}
                <a href="/signup" className="text-blue-600 hover:underline font-medium">
                  Sign Up
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
