import { useState, useEffect } from 'react'
import axios from 'axios'
import { Search, RefreshCw, RotateCw, ArrowLeft, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'

function ViewTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchBy, setSearchBy] = useState('admno')
  
  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:5000/v1/api/transactions', {
        withCredentials: true
      })
      setTransactions(response.data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to fetch transactions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handleSearchByChange = (e) => {
    setSearchBy(e.target.value)
  }

  const refreshTransactions = () => {
    fetchTransactions()
    toast.info('Transaction list refreshed')
  }
  
  const handleReturnBook = async (transactionId) => {
    try {
      await axios.put(`http://localhost:5000/v1/api/transactions/return/${transactionId}`, {}, {
        withCredentials: true
      })
      toast.success('Book returned successfully')
      fetchTransactions() 
    } catch (error) {
      console.error('Error returning book:', error)
      toast.error('Failed to return book. Please try again.')
    }
  }
  
const handleRenewBook = async (transactionId) => {
  try {
    const response = await axios.put(`http://localhost:5000/v1/api/transactions/renew/${transactionId}`, {}, {
      withCredentials: true
    })
    toast.success('Book renewed successfully')
    fetchTransactions() 
  } catch (error) {
    console.error('Error renewing book:', error)
    toast.error(error.response?.data?.message || 'Failed to renew book. Please try again.')
  }
}

  const isOverdue = (transaction) => {
    if (transaction.status === 'returned') return false

    const dueDate = transaction.dueDate
    if (!dueDate) return false
    
    const dueDateObj = new Date(dueDate)

    return new Date() > dueDateObj
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (!searchTerm) return true
    
    if (searchBy === 'bookTitle' && transaction.bookId) {
      return transaction.bookId.title.toLowerCase().includes(searchTerm.toLowerCase())
    }
 
    if (searchBy === 'userName' && transaction.userId) {
      return transaction.userId.name.toLowerCase().includes(searchTerm.toLowerCase())
    }

    if (searchBy === 'bookId.bookId' && transaction.bookId) {
      return transaction.bookId.bookId.toLowerCase().includes(searchTerm.toLowerCase())
    }
r
    if (searchBy === 'admno' && transaction.userId) {
      return transaction.userId.admno.toLowerCase().includes(searchTerm.toLowerCase())
    }

    if (transaction[searchBy]) {
      const searchValue = String(transaction[searchBy]).toLowerCase()
      return searchValue.includes(searchTerm.toLowerCase())
    }
    
    return false
  })

  return (
    <div className="p-6 max-w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">All Transactions</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search transactions..."
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
            <option value="bookId.bookId">Book ID</option>
            <option value="bookTitle">Book Title</option>
            <option value="admno">Admission No</option>
            <option value="userName">User Name</option>
            <option value="status">Status</option>
          </select>
          
          <button
            className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center hover:bg-blue-200 transition-colors"
            onClick={refreshTransactions}
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission No</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => {
                  const bookTitle = transaction.bookId ? transaction.bookId.title : 'Unknown Book'
                  const bookId = transaction.bookId ? transaction.bookId.bookId : 'Unknown ID'
                  const userName = transaction.userId ? transaction.userId.name : 'Unknown User'
                  const userAdmno = transaction.userId ? transaction.userId.admno : 'Unknown Admno'
                  const overdue = isOverdue(transaction)
                  
                  return (
                    <tr key={transaction._id} className={`hover:bg-gray-50 ${overdue ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {bookTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {bookId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userAdmno}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.issueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.status === 'returned' ? (
                          <span className="text-green-600">
                            Returned: {formatDate(transaction.returnDate)}
                          </span>
                        ) : (
                          <span className={overdue ? 'text-red-600 font-medium' : ''}>
                            Due: {formatDate(transaction.dueDate)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {overdue && transaction.status !== 'returned' ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            <AlertCircle size={14} className="mr-1" /> Overdue
                          </span>
                        ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${transaction.status === 'issued' ? 'bg-blue-100 text-blue-800' : 
                             transaction.status === 'returned' ? 'bg-green-100 text-green-800' : 
                             'bg-yellow-100 text-yellow-800'}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {transaction.status !== 'returned' && (
                            <>
                              <button
                                onClick={() => handleReturnBook(transaction._id)}
                                className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-full"
                                title="Return Book"
                              >
                                <ArrowLeft size={16} />
                              </button>
                              <button
                                onClick={() => handleRenewBook(transaction._id)}
                                className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded-full"
                                title="Renew Book"
                              >
                                <RotateCw size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? 'No transactions match your search criteria' : 'No transactions found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredTransactions.length}</span> {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
              {searchTerm && <span> matching "{searchTerm}" in {searchBy}</span>}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewTransactions