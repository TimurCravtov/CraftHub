import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Ban, CheckCircle } from 'lucide-react'
import Header from '../component/Header'
import { useAuthApi } from '../context/apiAuthContext.jsx'

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const { api } = useAuthApi()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users/findall')
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async (userId) => {
    if (!window.confirm('Are you sure you want to ban this user?')) return

    try {
      await api.post(`/api/users/${userId}/ban`)
      // Refresh list or update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, banned: true } : user
      ))
      alert('User banned successfully')
    } catch (error) {
      console.error('Error banning user:', error)
      alert('Failed to ban user')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage users and system settings</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-900">User</th>
                  <th className="px-6 py-4 font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-4 font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                        {/* Display roles if available, otherwise just 'User' */}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.accountType || 'User'}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        {user.banned ? (
                            <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-sm">
                                <Ban className="w-4 h-4" /> Banned
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-sm">
                                <CheckCircle className="w-4 h-4" /> Active
                            </span>
                        )}
                    </td>
                    <td className="px-6 py-4">
                      {!user.banned && (
                        <button
                            onClick={() => handleBanUser(user.id)}
                            className="text-red-600 hover:text-red-700 font-medium text-sm hover:underline"
                        >
                            Ban User
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
