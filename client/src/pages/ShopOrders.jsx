import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <button onClick={() => navigate('/account/shops')} className="hover:text-gray-900">My Shops</button>
          <span>&gt;</span>
          <span className="text-gray-900 font-medium">Shop Orders</span>
        </div>

        <h1 className="text-2xl font-bold mb-6">Shop Orders</h1>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="border rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()} {new Date(order.orderDate).toLocaleTimeString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">Total: {formatted(order.totalAmount)}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Customer Information</h3>
                      <p className="text-sm text-gray-600"><span className="font-medium">Name:</span> {order.buyerName}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Email:</span> {order.buyerEmail}</p>
                      <p className="text-sm text-gray-600"><span className="font-medium">Phone:</span> {order.phoneNumber}</p>
                      {order.note && (
                        <div className="mt-2">
                          <span className="text-xs font-medium text-gray-500 uppercase">Note:</span>
                          <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-100 mt-1">{order.note}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h3>
                      <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                      <p className="text-sm text-gray-600">{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
                      <p className="text-sm text-gray-600">{order.shippingCountry}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Items</h3>
                    <div className="space-y-3">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-900">{item.productName}</span>
                            <span className="ml-2 text-gray-500">x {item.quantity}</span>
                          </div>
                          <span className="text-gray-900">{formatted(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No orders found for this shop.</p>
          </div>
        )}
      </div>
    </div>
  )
}
