import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Package, Calendar, DollarSign, User, ChevronRight, Search, Filter, ArrowLeft, MapPin, Phone, Mail, MessageSquare } from 'lucide-react'
import Header from '../component/Header'
import { useAuthApi } from '../context/apiAuthContext.jsx'
import { useToast } from '../toastContext.jsx'

export default function ShopOrders() {
  const { shopId } = useParams()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { api } = useAuthApi()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const formatted = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get(`/api/orders/shop/${shopId}`)
        setOrders(response.data)
      } catch (error) {
        console.error('Error fetching orders:', error)
        showToast('Failed to load orders', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (shopId) {
      fetchOrders()
    }
  }, [shopId, api, showToast])

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <button 
            onClick={() => navigate('/account/shops')} 
            className="flex items-center text-sm text-gray-500 hover:text-[#16533A] transition-colors mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" />
            Back to My Shops
          </button>
          
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shop Orders</h1>
              <p className="mt-2 text-gray-600">Manage and track orders for this shop</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search orders..." 
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16533A]/20 focus:border-[#16533A] w-64"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-48 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                      <Package className="w-5 h-5 text-[#16533A]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order #{order.id}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Total Amount</p>
                      <p className="font-bold text-gray-900">{formatted(order.totalAmount)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        Customer Details
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-500 font-medium">
                            {order.buyerName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.buyerName}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <Mail className="w-3 h-3" />
                              {order.buyerEmail}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <Phone className="w-3 h-3" />
                              {order.phoneNumber}
                            </div>
                          </div>
                        </div>
                        {order.note && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex gap-2">
                              <MessageSquare className="w-3 h-3 text-yellow-600 mt-0.5" />
                              <div>
                                <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Note from customer</span>
                                <p className="text-sm text-gray-600 bg-yellow-50 p-2.5 rounded-lg border border-yellow-100">
                                  {order.note}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        Shipping Address
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {order.shippingAddress}<br />
                          {order.shippingCity}, {order.shippingState} {order.shippingZip}<br />
                          {order.shippingCountry}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{item.productName}</p>
                              <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                            </div>
                          </div>
                          <span className="font-medium text-gray-900">{formatted(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Orders will appear here once customers start purchasing from this shop.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
