import {Users, User, LibraryBig, LogOut, BookUp, BookPlus, ArrowLeftRight} from 'lucide-react'
import axios from 'axios'
import {useAuthContext} from '@/context/AuthContext'
import {useNavigate} from 'react-router-dom'
import { toast } from 'react-toastify'
import { useState } from 'react'
import AddBook from '@/components/AddBook'
import IssueBook from '@/components/IssueBook'
import ViewBooks from '@/components/AllBooks'
import ViewUsers from '@/components/ViewUsers'
import ViewTransactions from '@/components/ViewTransaction'

function AdminDashboard() {
  const {authUser, setAuthUser} = useAuthContext()
  const [activeView, setActiveView] = useState('viewBooks') 
  
  const navigate = useNavigate()
  
  const handleViewChange = (view) => {
    setActiveView(view)
  }
  
  const handleLogout = async() => {
    try {
      await axios.get('http://localhost:5000/v1/api/auth/logout', {withCredentials: true})
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      setAuthUser(null)
      toast.success('Logout successful')
      navigate('/')
    }
    catch (error) {
      console.error('Logout failed:', error)
      toast.error('Logout failed. Please try again.')
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="w-64 h-full bg-white shadow-lg">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200 flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            <h1 className="text-xl font-bold text-center text-gray-800">{authUser.name}</h1>
          </div>
          
          <ul className="mt-6 flex-grow px-4 space-y-1">
            <li>
              <button 
                className={`w-full text-left py-3 px-4 rounded-lg flex gap-3 items-center transition-colors ${activeView === 'viewBooks' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => handleViewChange('viewBooks')}
              >
              <LibraryBig size={18} />View Books
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left py-3 px-4 rounded-lg flex gap-3 items-center transition-colors ${activeView === 'addBook' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => handleViewChange('addBook')}
              >
                <BookUp size={18}/> Add Book
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left py-3 px-4 rounded-lg flex gap-3 items-center transition-colors ${activeView === 'allUsers' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => handleViewChange('allUsers')}
              >
               <Users size={18} />All Users
              </button>
            </li>
             <li>
              <button 
                className={`w-full text-left py-3 px-4 rounded-lg flex gap-3 items-center transition-colors ${activeView === 'issueBook' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => handleViewChange('issueBook')}
              >
               <BookPlus size={18} />Issue Book
              </button>
            </li>
            <li>
              <button 
                className={`w-full text-left py-3 px-4 rounded-lg flex gap-3 items-center transition-colors ${activeView === 'viewTransactions' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'}`}
                onClick={() => handleViewChange('viewTransactions')}
              >
               <ArrowLeftRight size={18} />View Transactions
              </button>
            </li>
          </ul>
          
          <div className="p-4 mt-auto border-t border-gray-200">
            <button className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-medium" onClick={handleLogout}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeView === 'viewBooks' && <ViewBooks />}
        {activeView === 'addBook' && <AddBook />}
        {activeView === 'allUsers' && <ViewUsers />}
        {activeView === 'viewTransactions' && <ViewTransactions />}
        {activeView === 'issueBook' && <IssueBook />}
      </div>
    </div>
  )
}

export default AdminDashboard