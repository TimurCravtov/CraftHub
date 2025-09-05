import { User, Search, Heart, ShoppingCart } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CraftHub
            </a>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <a href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">Home</a>
            <a href="/shops" className="text-sm font-medium text-slate-900 relative">
              Shops
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
            </a>
            <a href="/about" className="text-sm font-medium text-slate-600 hover:text-slate-900">About</a>
            <a href="/contact" className="text-sm font-medium text-slate-600 hover:text-slate-900">Contact</a>
          </nav>

          <div className="flex items-center space-x-2">
            <button className="p-2 rounded hover:bg-slate-100"><User className="h-5 w-5" /></button>
            <button className="p-2 rounded hover:bg-slate-100"><Search className="h-5 w-5" /></button>
            <button className="p-2 rounded hover:bg-slate-100"><Heart className="h-5 w-5" /></button>
            <button className="p-2 rounded hover:bg-slate-100"><ShoppingCart className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
    </header>
  )
}
