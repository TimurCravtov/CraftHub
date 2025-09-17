import Header from './component/Header.jsx'
import ManageShops from './pages/ManageShops'
import { Routes, Route } from 'react-router-dom';


export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <Routes>
        {/* ...other routes... */}
        <Route path="/account/shops" element={<ManageShops />} />
        <Route path="/create-shop" element={<Account />} />
        <Route path="/account/shops/:shopId" element={<Account />} />
      </Routes>

      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Page not found</h1>
          <p className="text-slate-600">The page you are looking for does not exist.</p>
          <a className="text-blue-600 hover:underline" href="/shops">Go to Shops</a>
        </div>
      </div>
    </div>
  )
}
