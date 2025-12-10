import { useState } from 'react'
import Header from '../component/Header.jsx'
import { useCart } from '../context/cartContext.jsx'
import { useAuthApi } from "../context/apiAuthContext.jsx"
import { useNavigate } from "react-router-dom"
import { useToast } from "../context/toastContext.jsx"
import { Phone, FileText, CreditCard, Banknote, ShoppingBag, ArrowLeft } from 'lucide-react'

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const formatted = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
  const navigate = useNavigate()
  const { api } = useAuthApi()
  const { showToast } = useToast()
  
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOrderButton = async (e) => {
      e.preventDefault()
      setIsSubmitting(true)
      
      try {
        const payload = {
          phoneNumber: phone,
          note: notes,
          shippingAddress: "", // Optional as per new design
          shippingCity: "",
          shippingState: "",
          shippingZip: "",
          shippingCountry: "",
          items: items.map(item => ({
            productId: item.id,
            quantity: item.qty
          }))
        }

        await api.post("/api/orders/create", payload)
        
        clearCart()
        showToast("Order placed successfully!", "success")
        navigate("/") // Or navigate to an order confirmation page if available
      } catch (error) {
        console.error("Failed to place order:", error)
        showToast("Failed to place order. Please try again.", "error")
      } finally {
        setIsSubmitting(false)
      }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="bg-white rounded-2xl shadow-sm p-12 max-w-lg mx-auto">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="mt-2 text-gray-600">Complete your order details below.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleOrderButton} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-8">
              
              {/* Contact Info */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-blue-600" />
                  Contact Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors py-2.5"
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      rows={4}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                      placeholder="Special instructions for delivery..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="pt-6 border-t border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  Payment Method
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="card" 
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only" 
                    />
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${paymentMethod === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block font-medium text-gray-900">Card Payment</span>
                        <span className="block text-xs text-gray-500">Pay securely with credit card</span>
                      </div>
                    </div>
                  </label>

                  <label className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input 
                      type="radio" 
                      name="payment" 
                      value="cash" 
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only" 
                    />
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${paymentMethod === 'cash' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block font-medium text-gray-900">Cash on Delivery</span>
                        <span className="block text-xs text-gray-500">Pay when you receive</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                Order Summary
              </h2>
              
              <div className="flow-root">
                <ul className="-my-6 divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id} className="flex py-6">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={item.imageLinks?.[0] || item.imageUrl || '/assets/product-placeholder.svg'}
                          alt={item.title}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3 className="line-clamp-1">{item.title}</h3>
                            <p className="ml-4">{formatted(item.price * item.qty)}</p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{item.shop?.name || 'Shop'}</p>
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <p className="text-gray-500">Qty {item.qty}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-200 mt-6 pt-6 space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <p>Subtotal</p>
                  <p className="font-medium text-gray-900">{formatted(subtotal)}</p>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <p>Shipping</p>
                  <p className="font-medium text-green-600">Free</p>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <p className="text-base font-bold text-gray-900">Total</p>
                  <p className="text-xl font-bold text-blue-600">{formatted(subtotal)}</p>
                </div>
              </div>

              <button
                onClick={handleOrderButton}
                disabled={isSubmitting}
                className="mt-8 w-full rounded-xl bg-blue-600 px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


