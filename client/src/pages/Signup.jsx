import { useState } from 'react'
import Header from '../component/Header.jsx'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [accountType, setAccountType] = useState('Buyer')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const user = { name, email, password, accountType };
    try {
      const response = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
    if (!response.ok) throw new Error("Failed to save user");

      const data = await response.json();
      alert("User registered successfully: " + JSON.stringify(data));
    
      // reset form
      setName("");
      setEmail("");
      setPassword("");
      setAccountType("Buyer");
      setAgreedToTerms(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Signup failed. Please try again.");
    }
  };


  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`)
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 space-y-6">
          <div className="text-left">
          <img 
                src="/assets/logo.png" 
                alt="CraftHub Logo" 
                className="h-8 w-auto"
              />
          </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-black">Get Started Now</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-black">
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 w-full bg-gray-50/30 border border-gray-200/60 rounded-full px-6 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition-all placeholder:text-gray-400/60 hover:border-gray-300"
                required
              />
            </div>

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

            <div className="space-y-2">
              <label className="text-sm font-medium text-black">Choose account type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType('BUYER')}
                  className={`h-10 rounded-full border transition-all ${accountType === 'BUYER' ? 'border-blue-600 text-white bg-gradient-to-r from-blue-600 to-purple-600' : 'border-gray-200/60 text-black bg-gray-50/30 hover:bg-gray-100/50'}`}
                >
                  Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType('SELLER')}
                  className={`h-10 rounded-full border transition-all ${accountType === 'SELLER' ? 'border-blue-600 text-white bg-gradient-to-r from-blue-600 to-purple-600' : 'border-gray-200/60 text-black bg-gray-50/30 hover:bg-gray-100/50'}`}
                >
                  Seller
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <label htmlFor="terms" className="text-sm text-black">
                I agree to the <button type="button" className="underline hover:no-underline">terms & policy</button>
              </label>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-full transition-all duration-300 hover:scale-[1.02] shadow-lg"
              disabled={!agreedToTerms}
            >
              Signup
            </button>
          </form>

          

          <div className="text-center">
            <span className="text-sm text-black">
              Have an account?{' '}
              <a href="/login" className="text-blue-600 hover:underline font-medium">
                Sign In
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}


