import Header from '../component/Header.jsx'
import { useCart } from '../cartContext.jsx'

export default function Checkout() {
  const { items, subtotal } = useCart()
  const formatted = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/modern-plant-store-with-pottery-and-plants-on-wood.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Checkout</h1>
          <div className="flex items-center space-x-2 text-white/80">
            <a href="/" className="hover:text-white">Home</a>
            <span>&gt;</span>
            <a href="/checkout" className="text-blue-600 font-semibold hover:text-white">Checkout</a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <form className="lg:col-span-2 space-y-5">
          <h2 className="text-lg font-semibold">Billing details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">First Name</label>
              <input className="w-full border rounded-md px-3 py-2" placeholder="John" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Last Name</label>
              <input className="w-full border rounded-md px-3 py-2" placeholder="Doe" />
            </div>
          </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">Town / City</label>
              <input className="w-full border rounded-md px-3 py-2" />
            </div>
          

          <div>
            <label className="block text-sm text-slate-600 mb-1">Street address</label>
            <input className="w-full border rounded-md px-3 py-2" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">Phone</label>
              <input className="w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">Email address</label>
              <input type="email" className="w-full border rounded-md px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-600 mb-1">Additional information</label>
            <textarea rows={3} className="w-full border rounded-md px-3 py-2" />
          </div>
        </form>

        <div className="lg:col-span-1">
          <div className="border rounded-lg p-5 space-y-4">
            <h3 className="font-semibold">Product</h3>
            <div className="divide-y">
              {items.map(it => (
                <div key={it.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-slate-700">{it.productName} <span className="text-slate-400">x {it.qty}</span></span>
                  <span className="font-medium">{formatted(it.price * it.qty)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span>{formatted(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-semibold text-amber-700">
              <span>Total</span>
              <span>{formatted(subtotal)}</span>
            </div>
            <div className="space-y-2 text-xs text-slate-600">
              <label className="flex items-center gap-2"><input type="radio" name="pay" defaultChecked /> Direct Bank Transfer</label>
              <p className="leading-relaxed"></p>
              <label className="flex items-center gap-2"><input type="radio" name="pay" /> Cash</label>
            </div>
            <button className="w-full rounded-lg bg-gray-900 text-white py-2 hover:bg-gray-800">Place order</button>
          </div>
        </div>
      </div>
    </div>
  )
}


