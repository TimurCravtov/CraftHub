import Header from '../component/Header.jsx'
import { useCart } from '../cartContext.jsx'
import { Trash } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const { items, updateQty, removeFromCart, subtotal } = useCart()
  const formatted = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/modern-plant-store-with-pottery-and-plants-on-wood.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Cart</h1>
          <div className="flex items-center space-x-2 text-white/80">
            <a href="/" className="hover:text-white">Home</a>
            <span>&gt;</span>
            <a href="/cart" className="text-blue-600 font-semibold hover:text-white">Cart</a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-50 text-xs font-medium text-slate-600 p-3">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right pr-2">Subtotal</div>
            </div>
            <div className="divide-y">
              {items.length === 0 && (
                <div className="p-6 text-slate-500 text-sm">Your cart is empty.</div>
              )}
              {items.map((it) => (
                <div key={it.id} className="grid grid-cols-12 items-center p-3">
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-slate-100">
                      <img src={it.imageUrl} alt={it.productName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{it.productName}</div>
                      <button onClick={() => removeFromCart(it.id)} className="mt-1 inline-flex items-center gap-1 text-xs text-red-600 hover:underline">
                        <Trash className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2 text-center text-sm">{formatted(it.price)}</div>
                  <div className="col-span-2 flex justify-center">
                    <input type="number" min={1} value={it.qty} onChange={(e) => updateQty(it.id, Number(e.target.value))} className="w-14 border rounded text-center" />
                  </div>
                  <div className="col-span-2 text-right pr-2 text-sm font-medium">{formatted(it.price * it.qty)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-lg border p-5 bg-amber-50/50">
            <h3 className="font-semibold mb-4">Cart Totals</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">{formatted(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Total</span>
                <span className="font-semibold text-amber-700">{formatted(subtotal)}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} className="mt-4 w-full rounded-lg bg-gray-900 text-white py-2 hover:bg-gray-800">Check Out</button>
          </div>
        </div>
      </div>
    </div>
  )
}


