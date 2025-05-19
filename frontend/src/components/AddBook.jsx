import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { BookUp } from 'lucide-react'

function AddBook() {
  const [bookData, setBookData] = useState({
    title: '',
    totalStock: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setBookData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Form validation
    if (!bookData.title.trim()) {
      toast.error('Please enter a book title')
      return
    }
    
    if (!bookData.totalStock || isNaN(bookData.totalStock) || parseInt(bookData.totalStock) <= 0) {
      toast.error('Please enter a valid stock quantity')
      return
    }

    try {
      setIsLoading(true)
      
      // Send POST request to add book
      const response = await axios.post(
        'http://localhost:5000/v1/api/transactions/add', 
        {
          title: bookData.title,
          totalStock: parseInt(bookData.totalStock)
        }, 
        { withCredentials: true }
      )
      
      toast.success('Book added successfully!')
      // Reset form after successful submission
      setBookData({ title: '', totalStock: '' })
    } catch (error) {
      console.error('Error adding book:', error)
      toast.error(error.response?.data?.message || 'Failed to add book. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 h-full flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <BookUp size={24} className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Add New Book</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Book Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={bookData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter book title"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="totalStock" className="block text-sm font-medium text-gray-700 mb-1">
              Total Stock
            </label>
            <input
              type="number"
              id="totalStock"
              name="totalStock"
              value={bookData.totalStock}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quantity"
              min="1"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md font-medium text-white ${
              isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            {isLoading ? 'Adding Book...' : 'Add Book'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddBook