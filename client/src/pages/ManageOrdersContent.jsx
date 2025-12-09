import { useState, useEffect } from 'react'
import { Package, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useAuthApi } from '../context/apiAuthContext.jsx'
import { useToast } from '../toastContext.jsx'

export default function ManageOrdersContent() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const { api } = useAuthApi()
  const { showToast } = useToast()
  const formatted = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/api/orders/seller/orders')
        setOrders(response.data)
      } catch (error) {
        console.error('Error fetching orders:', error)
        showToast('Failed to load orders', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [api, showToast])

  const toggleOrder = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
    } else {
      setExpandedOrder(orderId)
    }
  }

  const handleDeleteOrder = async (e, orderId) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this order?')) return

    try {
      await api.delete(`/api/orders/${orderId}`)
      setOrders(orders.filter(o => o.id !== orderId))
      showToast('Order deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting order:', error)
      showToast('Failed to delete order', 'error')
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#16533A]">Shop Orders</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#16533A]"></div>
            <div className="text-gray-500 font-medium">Loading orders...</div>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
          <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">When customers buy from your shops, orders will appear here for you to manage.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
              <div 
                className="px-8 py-6 flex flex-wrap justify-between items-center cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => toggleOrder(order.id)}
              >
                <div className="flex items-center gap-6">
                  <div className={`p-3 rounded-xl transition-colors ${
                    order.status === 'COMPLETED' ? 'bg-[#16533A]/10 text-[#16533A]' :
                    order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-bold text-gray-900 text-lg">Order #{order.id}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                        order.status === 'COMPLETED' ? 'bg-[#16533A]/10 text-[#16533A]' :
                        order.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                      <span>{new Date(order.orderDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span>{new Date(order.orderDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 mt-4 sm:mt-0">
                  <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium mb-0.5">Total Amount</p>
                    <p className="font-bold text-xl text-[#16533A]">{formatted(order.totalAmount)}</p>
                  </div>
                  <div className="flex items-center gap-3 pl-8 border-l border-gray-100">
                    <button 
                      onClick={(e) => handleDeleteOrder(e, order.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-all duration-200"
                      title="Delete Order"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <div className={`p-2 rounded-lg transition-all duration-200 ${expandedOrder === order.id ? 'bg-[#16533A]/10 text-[#16533A]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                      {expandedOrder === order.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </div>
                </div>
              </div>
              
              {expandedOrder === order.id && (
                <div className="px-8 py-8 border-t border-gray-100 bg-gray-50/30 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                      <h3 className="text-sm font-bold text-[#16533A] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <User className="h-4 w-4" /> Customer Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <span className="block text-xs text-gray-500 font-semibold uppercase mb-1">Name</span>
                          <span className="font-medium text-gray-900">{order.buyerName}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500 font-semibold uppercase mb-1">Email</span>
                          <span className="font-medium text-gray-900">{order.buyerEmail}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-gray-500 font-semibold uppercase mb-1">Phone</span>
                          <span className="font-medium text-gray-900">{order.phoneNumber}</span>
                        </div>
                      </div>
                      {order.note && (
                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <span className="block text-xs text-gray-500 font-semibold uppercase mb-2">Note from customer</span>
                          <p className="text-sm text-gray-700 bg-amber-50 p-3 rounded-lg border border-amber-100 italic">"{order.note}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead className="bg-gray-50/80">
                        <tr>
                          <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product</th>
                          <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                          <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                          <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {order.items.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatted(item.price)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{formatted(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50/80">
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-right text-sm font-bold text-gray-900">Order Total</td>
                          <td className="px-6 py-4 text-right text-lg font-bold text-[#16533A]">{formatted(order.totalAmount)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function User(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
