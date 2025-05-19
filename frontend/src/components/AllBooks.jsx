import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Search, LibraryBig, Plus, XCircle } from 'lucide-react'

function ViewBooks() {
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updateStockModalOpen, setUpdateStockModalOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [stockToAdd, setStockToAdd] = useState(1)

  useEffect(() => {
    fetchBooks()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredBooks(books)
    } else {
      const lowercasedSearch = searchTerm.toLowerCase()
      const filtered = books.filter(book => 
        book.title.toLowerCase().includes(lowercasedSearch) || 
        book.bookId.toLowerCase().includes(lowercasedSearch)
      )
      setFilteredBooks(filtered)
    }
  }, [searchTerm, books])

  const fetchBooks = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await axios.get('http://localhost:5000/v1/api/books', { withCredentials: true })
      setBooks(response.data)
      setFilteredBooks(response.data)
    } catch (error) {
      console.error('Error fetching books:', error)
      setError('Failed to fetch books. Please try again.')
      toast.error('Failed to load books')
    } finally {
      setIsLoading(false)
    }
  }

  const getStockStatus = (book) => {
    if (!book.isAvailable) {
      return { label: 'Out of Stock', class: 'bg-red-100 text-red-800' }
    }
    
    const stockPercentage = (book.currentStock / book.totalStock) * 100
    
    if (stockPercentage <= 20) {
      return { label: 'Low Stock', class: 'bg-yellow-100 text-yellow-800' }
    }
    
    return { label: 'Available', class: 'bg-green-100 text-green-800' }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Refreshes the book list
  const handleRefresh = () => {
    fetchBooks()
    toast.info('Book list refreshed')
  }

  // Opens the update stock modal for a specific book
  const openUpdateStockModal = (book) => {
    setSelectedBook(book)
    setStockToAdd(1)
    setUpdateStockModalOpen(true)
  }

  // Handle stock update
  const handleUpdateStock = async () => {
    if (!selectedBook || stockToAdd <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }
    try {
      const response = await axios.put(
        `http://localhost:5000/v1/api/transactions/${selectedBook._id}`,
        { newStockTobeAdded: parseInt(stockToAdd) },
        { withCredentials: true }
      )
      
      // Update local state
      const updatedBooks = books.map(book => 
        book.bookId === selectedBook.bookId ? response.data.book : book
      )
      
      setBooks(updatedBooks)
      setFilteredBooks(updatedBooks)
      toast.success('Stock updated successfully')
      setUpdateStockModalOpen(false)
    } catch (error) {
      console.error('Error updating stock:', error)
      toast.error('Failed to update stock')
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LibraryBig size={24} className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Book Inventory</h2>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by title or book ID..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading books...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p>{error}</p>
          <button 
            onClick={fetchBooks}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {filteredBooks.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">No books found matching your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBooks.map((book) => {
                    const status = getStockStatus(book)
                    return (
                      <tr key={book._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {book.bookId} 
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {book.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {book.currentStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {book.totalStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => openUpdateStockModal(book)}
                            className="px-3 py-1 bg-green-600 text-white rounded-md text-xs hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center gap-1"
                          >
                            <Plus size={14} />
                            Update Stock
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredBooks.length} of {books.length} books
          </div>
        </>
      )}

      {updateStockModalOpen && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Stock</h3>
              <button 
                onClick={() => setUpdateStockModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Book: <span className="font-semibold">{selectedBook.title}</span></p>
              <p className="text-sm text-gray-600 mb-2">Current Stock: <span className="font-semibold">{selectedBook.currentStock}</span></p>
              <p className="text-sm text-gray-600 mb-2">Total Stock: <span className="font-semibold">{selectedBook.totalStock}</span></p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="stockToAdd" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Stock
              </label>
              <input
                type="number"
                id="stockToAdd"
                value={stockToAdd}
                onChange={(e) => setStockToAdd(Math.max(1, parseInt(e.target.value) || 0))}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setUpdateStockModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStock}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ViewBooks