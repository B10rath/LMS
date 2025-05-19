import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { BookPlus } from 'lucide-react'

function IssueBook() {
  const [formData, setFormData] = useState({
    bookId: '',
    admno: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Form validation
    if (!formData.bookId.trim()) {
      toast.error('Please enter a book ID')
      return
    }
    
    if (!formData.admno.trim()) {
      toast.error('Please enter an admission number')
      return
    }

    try {
      setIsLoading(true)
      
      // Send POST request to issue book
      const response = await axios.post(
        'http://localhost:5000/v1/api/transactions/', 
        {
          bookId: formData.bookId,
          admno: formData.admno
        }, 
        { withCredentials: true }
      )
      
      toast.success('Book issued successfully!')
      // Reset form after successful submission
      setFormData({ bookId: '', admno: '' })
    } catch (error) {
      console.error('Error issuing book:', error)
      toast.error(error.response?.data?.message || 'Failed to issue book. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 h-full flex items-center justify-center">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <BookPlus size={24} className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Issue Book</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="bookId" className="block text-sm font-medium text-gray-700 mb-1">
              Book ID
            </label>
            <input
              type="text"
              id="bookId"
              name="bookId"
              value={formData.bookId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter book ID"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="admno" className="block text-sm font-medium text-gray-700 mb-1">
              Admission Number
            </label>
            <input
              type="text"
              id="admno"
              name="admno"
              value={formData.admno}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter admission number"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md font-medium text-white ${
              isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            {isLoading ? 'Issuing Book...' : 'Issue Book'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default IssueBook