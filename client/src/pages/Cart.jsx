import Header from '../component/Header.jsx'
import { useCart } from '../cartContext.jsx'
import { Trash, Minus, Plus, ShoppingBag, ArrowRight, Store } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const { items, updateQty, removeFromCart, subtotal } = useCart()
  const formatted = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <div className="relative h-[300px] overflow-hidden">
        <div className="absolute inset-0">
            <img 
                src="/assets/modern-plant-store-with-pottery-and-plants-on-wood.jpg" 
                alt="Cart Hero" 
                className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 backdrop-blur-md rounded-2xl mb-6 ring-1 ring-white/20 shadow-xl">
            <ShoppingBag className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Your Cart</h1>
          <div className="flex items-center space-x-2 text-gray-300 text-sm font-medium bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
            <a href="/" className="hover:text-white transition-colors">Home</a>
            <span>/</span>
            <span className="text-white">Cart</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        Shopping Cart
                        <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                            {items.length} items
                        </span>
                    </h2>
                </div>

                {items.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                        <ShoppingBag className="h-8 w-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Your cart is empty</h3>
                    <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
                    <a href="/shops" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#16533A] text-white font-medium hover:bg-[#16533A]/90 transition-all shadow-lg shadow-[#16533A]/20">
                        Start Shopping
                    </a>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Header for desktop */}
                    <div className="hidden sm:grid grid-cols-12 text-xs font-semibold text-gray-400 uppercase tracking-wider pb-4 border-b border-gray-100">
                      <div className="col-span-6">Product</div>
                      <div className="col-span-2 text-center">Price</div>
                      <div className="col-span-2 text-center">Quantity</div>
                      <div className="col-span-2 text-right">Total</div>
                    </div>

                    {items.map((it) => (
                      <div key={it.id} className="group flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:gap-0 items-center py-4 sm:py-2 border-b border-gray-50 last:border-0">
                        
                        {/* Product Info */}
                        <div className="col-span-6 w-full flex items-center gap-4">
                          <div className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-gray-100 border border-gray-100">
                            <img src={it.imageUrl} alt={it.title} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex flex-col">
                            <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{it.title}</h3>
                            <p className="text-sm text-gray-500 mb-2">{it.shopName || 'Artisan Shop'}</p>
                            <button 
                                onClick={() => removeFromCart(it.id)} 
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 transition-colors group/btn"
                            >
                              <Trash className="h-3.5 w-3.5 transition-transform group-hover/btn:scale-110" /> 
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="col-span-2 text-center text-sm font-medium text-gray-600 hidden sm:block">
                            {formatted(it.price)}
                        </div>

                        {/* Quantity Control */}
                        <div className="col-span-2 flex justify-center w-full sm:w-auto">
                            <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50">
                                <button 
                                    onClick={() => updateQty(it.id, Math.max(1, it.qty - 1))}
                                    className="p-2 hover:text-[#16533A] transition-colors disabled:opacity-50"
                                    disabled={it.qty <= 1}
                                >
                                    <Minus className="h-3.5 w-3.5" />
                                </button>
                                <input 
                                    type="number" 
                                    min={1} 
                                    value={it.qty} 
                                    onChange={(e) => updateQty(it.id, Math.max(1, Number(e.target.value)))} 
                                    className="w-10 bg-transparent text-center text-sm font-medium text-gray-900 focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                />
                                <button 
                                    onClick={() => updateQty(it.id, it.qty + 1)}
                                    className="p-2 hover:text-[#16533A] transition-colors"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Subtotal */}
                        <div className="col-span-2 text-right text-sm font-bold text-gray-900 w-full sm:w-auto flex justify-between sm:block items-center mt-2 sm:mt-0">
                            <span className="sm:hidden text-gray-500 font-normal">Total:</span>
                            {formatted(it.price * it.qty)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
                <a href="/shops" className="text-sm font-medium text-gray-500 hover:text-[#16533A] flex items-center gap-2 transition-colors">
                    <ArrowRight className="h-4 w-4 rotate-180" /> Continue Shopping
                </a>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-gray-100 p-6 sm:p-8 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-semibold text-gray-900">{formatted(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Shipping estimate</span>
                  <span className="text-gray-400 italic">Calculated at checkout</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tax estimate</span>
                  <span className="text-gray-400 italic">Calculated at checkout</span>
                </div>
                
                <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-gray-900">Order Total</span>
                        <span className="text-2xl font-bold text-[#16533A]">{formatted(subtotal)}</span>
                    </div>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')} 
                disabled={items.length === 0}
                className="w-full py-4 px-6 rounded-xl bg-[#16533A] text-white font-bold text-lg shadow-xl shadow-[#16533A]/20 hover:bg-[#16533A]/90 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
              >
                Checkout <ArrowRight className="h-5 w-5" />
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                <Store className="h-3.5 w-3.5" />
                <span>Secure checkout powered by CraftHub</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


