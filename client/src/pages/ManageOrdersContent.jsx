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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Shop Orders</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-600">Loading orders...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600">When customers buy from your shops, orders will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border rounded-lg overflow-hidden shadow-sm bg-white">
              <div 
                className="px-6 py-4 border-b bg-gray-50 flex flex-wrap justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleOrder(order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    order.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()} • {new Date(order.orderDate).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 mt-2 sm:mt-0">
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatted(order.totalAmount)}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteOrder(e, order.id)}
                    className="p-1 hover:bg-red-100 rounded-full text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete Order"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  {expandedOrder === order.id ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                </div>
              </div>
              
              {expandedOrder === order.id && (
                <div className="px-6 py-6 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" /> Customer Information
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{order.buyerName}</span></p>
                        <p className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900">{order.buyerEmail}</span></p>
                        <p className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-medium text-gray-900">{order.phoneNumber}</span></p>
                        {order.note && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <span className="text-xs font-medium text-gray-500 uppercase block mb-1">Note from customer:</span>
                            <p className="text-sm text-gray-700 bg-yellow-50 p-2 rounded border border-yellow-100 italic">"{order.note}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.items.map(item => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatted(item.price)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{formatted(item.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-900">Order Total</td>
                          <td className="px-6 py-3 text-right text-sm font-bold text-indigo-600">{formatted(order.totalAmount)}</td>
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
