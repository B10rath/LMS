import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, RefreshCw } from 'lucide-react'
import { toast } from 'react-toastify'

function ViewUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchBy, setSearchBy] = useState('name')
  
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:5000/v1/api/transactions/all', {
        withCredentials: true
      })
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSearchByChange = (e) => {
    setSearchBy(e.target.value)
  }

  const refreshUsers = () => {
    fetchUsers()
    toast.info('User list refreshed')
  }

  // Filter users based on search term and search by field
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true
    
    const searchValue = String(user[searchBy]).toLowerCase()
    return searchValue.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="p-6 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">All Users</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search users..."
              onChange={handleSearch}
              value={searchTerm}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          
          <select
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onChange={handleSearchByChange}
            value={searchBy}
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="admno">Admission No</option>
            <option value="branch">Branch</option>
            <option value="semester">Semester</option>
          </select>
          
          <button
            className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
            onClick={refreshUsers}
          >
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission No</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.admno}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.branch}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.semester}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? 'No users match your search criteria' : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredUsers.length}</span> {filteredUsers.length === 1 ? 'user' : 'users'}
              {searchTerm && <span> matching "{searchTerm}" in {searchBy}</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewUsers